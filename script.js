const ctx = document.getElementById('myChart');
const config = {
  type: 'line',
  options: {
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


fetch('data/temperature.csv')
  .then(response => response.text())
  .then(text => {
    let data = fromCSV(text);
    let places = new Map();

    for (let entry of data) {
      places[entry.Country] ||= new Map();
      places[entry.Country][entry.City] ||= [];
      const date = new Date(entry.year, entry.month, entry.day);

      let value = parseFloat(entry.AverageTemperatureFahr);
      places[entry.Country][entry.City].push({
        x: date.getTime(),
        y: convertFahrenheitToCelsius(value)
      });
    }

    let dataset = [];
    for (let country in places) {
      for (let city in places[country]) {
        dataset.push({
          label: `${country}/${city}`,
          hidden: true,
          data: places[country][city].sort((a,b) => a.x - b.x),
          borderWidth: 1,
        });
      }
    }

    dataset.sort((a,b) => a.label.localeCompare(b.label));
    dataset[0].hidden = false;
    dataset[1].hidden = false;

    console.log(dataset);
    config.data.datasets = dataset;
    chart.update();
  });

function fromCSV(text) {
  // Split into lines and filter out empty lines
  let lines = text.split('\n').filter(Boolean);
  let objects = [];
  let headers = removeQuotes(lines[0].split(','));
  for (let i = 1; i < lines.length; i++) {
    let line = removeQuotes(lines[i].split(','));
    let entry = {};
    for (let col in headers) {
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
