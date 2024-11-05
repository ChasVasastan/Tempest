const ctx = document.getElementById('myChart');
fetch('data/temperature.csv')
  .then(response => response.text())
  .then(text => {
    let labels = new Set();
    let places = {};

    let data = fromCSV(text);
    for (let entry of data) {
      let key = entry.Country+'/'+entry.City;
      let country = places[key] || Object.assign(places, {[key]: []})[key];
      let date = `${entry.year}-${entry.month}-${entry.day}`;
      labels.add(date);

      let value = parseFloat(entry.AverageTemperatureFahr);
      country.push({x: date, y: convertFahrenheitToCelsius(value)});
    }

    let dataset = [];
    for (let key in places) {
      dataset.push({
        label: key,
        hidden: true,
        data: places[key].sort((a,b) => a.x.localeCompare(b.x)),
        borderWidth: 1,
      });
    }

    dataset.sort((a,b) => a.label.localeCompare(b.label));
    dataset[0].hidden = false;
    dataset[1].hidden = false;

    console.log(dataset);
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from(labels).sort(),
        datasets: dataset,
      },
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
            title: {
              display: true,
              text: 'Date',
            }
          },
        }
      }
    });
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