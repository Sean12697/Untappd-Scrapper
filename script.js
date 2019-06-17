const fs = require('fs'),
    rp = require('request-promise'),
    $ = require('cheerio'),
    beautify = require('beautify'),
    beaut = (obj) => beautify(JSON.stringify(obj), {
        format: 'json'
    }),
    user = "Sean12697",
    url_sort = `https://untappd.com/user/${user}/beers?sort=`,
    // sorts = ["highest_rated_their", "lowest_rated_their", "beer_name_asc", "beer_name_desc", "brewery_name_asc", "brewery_name_desc", "date", "date_asc"]
    sorts = ["highest_rated_their", "lowest_rated_their", "date"]
urls = sorts.map(sort => url_sort + sort);


async function getUniqueBeersWithFlavours(urls) {
    return new Promise(resolve => {
        getUniqueBeers(urls).then(beers => {
            let merged = [].concat.apply([], beers);
            Promise.all(merged.map(getFlavours)).then(resolve);
        });
    });
}

async function getUniqueBeers(urls) {
    return new Promise(resolve => {
        Promise.all(urls.map(getBeers)).then(beers => {
            let merged = [].concat.apply([], beers);
            resolve(removeDuplicates(merged, "name"));
        });
    });
}

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
                beerJSON.last_location = $('.location a', html).text();
                beerJSON.comment = $('.comment', html).text().replace(/[\n]/g, "").trim();
                beerJSON.serving = $('.serving span', html).text().replace(/\s/g, "");
                delete beerJSON.last_checkin_url;
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

// https://stackoverflow.com/questions/2218999/remove-duplicates-from-an-array-of-objects-in-javascript
function removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
}

// getBeersWithFlavour(urls[0]).then(data => {
//     fs.writeFileSync(`beers.json`, beaut(data), () => {});
// });

// getUniqueBeersWithFlavours(urls).then(data => {
//     fs.writeFileSync(`beers.json`, beaut(data), () => {});
// });

getBeersWithFlavour(urls[0]).then(best => {
    getBeersWithFlavour(urls[1]).then(worst => {
        // getBeersWithFlavour(urls[2]).then(recent => {
            let merged = [].concat.apply([], [best, worst]);
            let unique = removeDuplicates(merged, "name");
            fs.writeFileSync(`beers.json`, beaut(unique), () => {});
        // });
    });
});