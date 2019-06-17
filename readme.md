# Unoffical Untappd Scrapper

This a simple script made to gather a users rated Beers, currently it is only retriving the top and bottom 25 beers according to a users rating, but in the future it might gather more and different types of data.

There is a simple untappd Class for now, demoed usage in the `script.js` Script, producing an array of 50 beers with the follow formatted example:

```json
{
    "name": "Créme Bearlee",
    "brewery": "Beartown Brewery",
    "style": "Stout - Milk / Sweet",
    "their_rating": 5,
    "global_rating": 3.88,
    "abv": 4.8,
    "ibu": null,
    "flavours": ["Vanilla", "Sweet", "Creamy", "Dark", "Thick"],
    "last_location": "The Thirsty Scholar",
    "comment": "So rich/smooth/creamy, definitely still my favourite beer for that, so easily drinkable",
    "serving": "Draft"
}
```