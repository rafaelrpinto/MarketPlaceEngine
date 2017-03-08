"use strict"
// dependencies
let express = require('express');
let router = express.Router();
let winston = require('winston');
// model
let Episode = require('../model/Episode');

/*
	Searches for TV Series episodes title on OMDB.
*/
router.get('/:serieImdbId/:seasonNumber', (req, res) => {

    //check the title
    let serieImdbId = req.params.serieImdbId;
    if (!serieImdbId || serieImdbId.trim().length == 0) {
        return res.status(400).send("Invalid serieImdbId.");
    }

    //check the season number
    let seasonNumber = Number(req.params.seasonNumber);
    if (isNaN(seasonNumber) || seasonNumber < 1 || seasonNumber % 1 !== 0) {
        return res.status(400).send("Invalid season number.");
    }

    let searchParams = {
        serieImdbId: serieImdbId,
        seasonNumber: seasonNumber
    };

    //Searches for episodes
    Episode.search(searchParams).then((episodes) => {
        if (episodes.length == 0) {
            let msg = "No episodes found (Or you requested an invalid season).";
            res.status(404).send(msg);
            winston.debug(msg, searchParams);
        } else {
            //returns the json
            res.json(episodes);
        }
    }).catch((err) => {
        winston.error("Error searching episodes", err);
        res.status(500).send("Internal error.");
    });
});

module.exports = router;
