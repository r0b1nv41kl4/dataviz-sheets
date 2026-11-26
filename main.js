import Chart from 'chart.js/auto';

function readings(sheet, metric) {
  const points = sheet[metric] ?? [];
  return points
    .filter(point => point.date)
    .map(({ date, value }) => ({
      date,
      value: Number.isFinite(value) ? value : null,
    }));
}

function draw(id, type, unit, datasets) {
  new Chart(document.getElementById(id), {
    type,
    data: { datasets },
    options: {
      parsing: { xAxisKey: 'date', yAxisKey: 'value' },
      scales: { y: { beginAtZero: true, title: { display: true, text: unit } } },
    },
  });
}

function participantDatasets(sheets, metric) {
  const dates = new Set();
  const participants = sheets.map(sheet => {
    const byDate = new Map();
    for (const { date, value } of readings(sheet, metric)) {
      dates.add(date);
      byDate.set(date, value);
    }
    return { name: sheet.name, byDate };
  });

  const calendar = [...dates].sort();
  return participants.map(({ name, byDate }) => ({
    label: name,
    data: calendar.map(date => ({ date, value: byDate.get(date) ?? null })),
  }));
}

async function drawCharts() {
  const response = await fetch('/api/data');
  const sheets = await response.json();
  if (!response.ok) throw new Error(sheets.error);

  const first = sheets[0];
    const steps = readings(first, 'steps_count');
  draw('steps', 'line', 'Steps', [
    { label: first.name, data: steps },
  ])
  const minutes = readings(first, 'screen_total_min')
  draw('minutes', 'line', 'Minutes', [
  { label: first.name, data: minutes },] ); 
  draw('all-steps', 'line', 'Steps', participantDatasets(sheets, 'steps_count'));
  draw('all-minutes', 'line', 'Minutes', participantDatasets(sheets, 'screen_total_min'))
  const stepsByDate = new Map();
for (const sheet of sheets) {
  for (const { date, value } of readings(sheet, 'steps_count')) {
    if (!stepsByDate.has(date)) stepsByDate.set(date, []);
    if (value !== null) stepsByDate.get(date).push(value);
  }
}
}

drawCharts().catch(error => {
  document.querySelector('#error').textContent = error.message;
});