const ctx = document.getElementById('myChart');
const config = {
  type: 'line',
  options: {
    animation: false,
    parsing: false,
    plugins: {
      legend: {
        position: 'right',
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Temperature in Celsius',
        }
      },
      x: {
        type: 'time',
        time: {
          unit: 'month'
        },
        title: {
          display: true,
          text: 'Date',
        }
      },
    }
  }
};

const chart = new Chart(ctx, config);

document.getElementById('date-start').addEventListener('change', (event) => {
  config.options.scales.x.min = event.target.value;
  chart.update();
});
document.getElementById('date-end').addEventListener('change', (event) => {
  config.options.scales.x.max = event.target.value;
  chart.update();
});

// Get temperature data and populate chart
fetch('data/temperature.csv')
  .then(response => response.text())
  .then(text => {
    const data = fromCSV(text);
    let places = new Map();

    // Load data
    for (const entry of data) {
      places[entry.Country] ||= new Map();
      places[entry.Country][entry.City] ||= [];

      const entryDate = new Date(entry.year, entry.month, entry.day);
      const fahrenheit = parseFloat(entry.AverageTemperatureFahr);
      places[entry.Country][entry.City].push({
        x: entryDate.getTime(),
        y: convertFahrenheitToCelsius(fahrenheit)
      });
    }

    // Populate chart
    let dataset = [];
    for (const country in places) {
      for (const city in places[country]) {
        places[country][city].sort((a,b) => a.x - b.x);
        dataset.push({
          label: `${country}/${city}`,
          hidden: true,
          data: places[country][city],
          borderWidth: 1,
        });
      }
    }

    dataset.sort((a,b) => a.label.localeCompare(b.label));
    dataset[0].hidden = false;
    dataset[1].hidden = false;
    config.data.datasets = dataset;
    chart.update();
  });

function fromCSV(text) {
  // Split into lines and filter out empty lines
  const lines = text.split('\n').filter(Boolean);
  const headers = removeQuotes(lines[0].split(','));
  let objects = [];
  for (let i = 1; i < lines.length; i++) {
    const line = removeQuotes(lines[i].split(','));
    let entry = {};
    for (const col in headers) {
      entry[headers[col]] = line[col];
    }
    objects.push(entry);
  }
  return objects;
}

function removeQuotes(array) {
  return array.map(string => string.replace(/["]+/g, ''));
}

function convertFahrenheitToCelsius(value) {
  return (value - 32) / 1.8;
}
