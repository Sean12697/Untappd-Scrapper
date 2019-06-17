const untappd = require('./untappd'),
      fs = require('fs'),
      beautify = require('beautify'),
      beaut = (obj) => beautify(JSON.stringify(obj), {
          format: 'json'
      });

let untappdAPI = new untappd("Sean12697");
untappdAPI.getUsersBeers().then(beers => {
    fs.writeFileSync(`beers.json`, beaut(beers), () => {});
});