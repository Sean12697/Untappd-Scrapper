const rp = require('request-promise'),
    $ = require('cheerio');

class untappd {

    constructor(user) {
        this.setUser(user);
    }

    setUser(user) {
        this.user = user || "";
        this.url_sort = `https://untappd.com/user/${user}/beers?sort=`,
        this.sorts = ["highest_rated_their", "lowest_rated_their", "date"]
        this.urls = this.sorts.map(sort => this.url_sort + sort);
    }

    async getUniqueBeersWithFlavours(urls) {
        return new Promise(resolve => {
            this.getUniqueBeers(urls).then(beers => {
                let merged = [].concat.apply([], beers);
                Promise.all(merged.map(this.getFlavours)).then(resolve);
            });
        });
    }
    
    async getUniqueBeers(urls) {
        return new Promise(resolve => {
            Promise.all(urls.map(this.getBeers)).then(beers => {
                let merged = [].concat.apply([], beers);
                resolve(this.removeDuplicates(merged, "name"));
            });
        });
    }
    
    async getBeersWithFlavour(url) {
        return new Promise(resolve => {
            this.getBeers(url).then(beers => {
                Promise.all(beers.map(this.getFlavours)).then(resolve);
            });
        });
    }
    
    async getFlavours(beerJSON) {
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
    
    async getBeers(url) {
        return new Promise(resolve => {
            rp(url)
                .then(html => {
                    let beers = [];
                    let loaded = $.load(html);
                    loaded('.beer-item').each((index, element) => beers.push(this.beerJSON(element)));
                    resolve(beers);
                })
                .catch(err => {
                    //handle error
                    console.log("Getting Beers Error", err)
                });
        });
    }
    
    beerJSON(beerHTML) {
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
    removeDuplicates(originalArray, prop) {
        let newArray = [], lookupObject = {};
        for (let i in originalArray) lookupObject[originalArray[i][prop]] = originalArray[i];
        for (let i in lookupObject) newArray.push(lookupObject[i]); 
        return newArray;
    }
    
    async getUsersBeers() { // Limited due to DDOS protection and not signed in (to get more data)
        return new Promise(resolve => {
            this.getBeersWithFlavour(this.urls[0]).then(best => {
                this.getBeersWithFlavour(this.urls[1]).then(worst => {
                    // getBeersWithFlavour(this.urls[2]).then(recent => {
                        let merged = [].concat.apply([], [best, worst]);
                        let unique = this.removeDuplicates(merged, "name");
                        resolve(unique);
                        // fs.writeFileSync(`beers.json`, beaut(unique), () => {});
                    // });
                });
            });
        });
    }
    
}

module.exports = untappd;