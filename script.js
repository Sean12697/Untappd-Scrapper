const fs = require('fs'),
    rp = require('request-promise'),
    $ = require('cheerio'),
    beautify = require('beautify'),
    beaut = (obj) => beautify(JSON.stringify(obj), {
        format: 'json'
    }),
    user = "Sean12697",
    url_top = `https://untappd.com/user/${user}/beers?sort=highest_rated_their`;

async function getBeersWithFlavour(url) {
    return new Promise(resolve => {
        getBeers(url).then(beers => {
            Promise.all(beers.map(getFlavours)).then(resolve);
        });
    });
}

async function getFlavours(beerJSON) {
    return new Promise(resolve => {
        rp(beerJSON.last_checkin_url)
            .then(html => {
                let flavours = [];
                let loaded = $.load(html);
                loaded('.flavor li').each((index, element) => flavours.push($('span', element).text()));
                beerJSON.flavours = flavours;
                resolve(beerJSON);
            })
            .catch(err => {
                //handle error
                console.log("Getting Flavours Error", err)
            });
    });
}

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
                console.log("Getting Beers Error", err)
            });
    });
}

function beerJSON(beerHTML) {
    return {
        name: $('.name a', beerHTML).text(),
        brewery: $('.brewery a', beerHTML).text(),
        style: $('.style', beerHTML).text(),
        their_rating: parseFloat($('.ratings .you:first-child p', beerHTML).text().replace("Their Rating (", "").replace(")", "")),
        global_rating: parseFloat($('.ratings .you:last-child p', beerHTML).text().replace("Global Rating (", "").replace(")", "")),
        abv: parseFloat($('.abv', beerHTML).text().replace("% ABV", "")),
        ibu: parseFloat($('.ibu', beerHTML).text().replace(" IBU", "")),
        last_checkin_url: 'https://untappd.com' + $('.details p:nth-child(4) a', beerHTML).attr().href
    }
}
getBeersWithFlavour(url_top).then(data => {
    fs.writeFileSync(`beers.json`, beaut(data), () => {});
});