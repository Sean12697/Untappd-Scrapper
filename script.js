const fs = require('fs'),
    rp = require('request-promise'),
    $ = require('cheerio'),
    beautify = require('beautify'),
    beaut = (obj) => beautify(JSON.stringify(obj), {
        format: 'json'
    }),
    user = "Sean12697",
    url_top = `https://untappd.com/user/${user}/beers?sort=highest_rated_their`;

async function getBeers(url) {
    return new Promise(resolve => {
        rp(url)
            .then(html => {
                let beers = [];
                let loaded = $.load(html);
                loaded('.beer-item').each((index, element) => beers.push(beerJSON(element)));
                resolve(beers);
            })
            .catch(err => {
                //handle error
            });
    });
}

function beerJSON(beerHTML) {
    return {
        name: $('.name a', beerHTML).text()
    }
}

getBeers(url_top).then(data => {
    fs.writeFileSync(`beers.json`, beaut(data), () => {});
});