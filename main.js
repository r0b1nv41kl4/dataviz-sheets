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

async function drawCharts() {
  const response = await fetch('/api/data');
  const sheets = await response.json();
  if (!response.ok) throw new Error(sheets.error);

  const first = sheets[0];
    const steps = readings(first, 'steps_count');
  draw('steps', 'bar', 'Steps', [
    { label: first.name, data: steps },
  ]);
}

drawCharts().catch(error => {
  document.querySelector('#error').textContent = error.message;
});