"use strict"

var Episode = require('../model/Episode');
var express = require('express');
var router = express.Router();
var winston = require('winston');

/*
	Searches for TV Series episodes title on OMDB.
*/
router.get('/:serieImdbId/:seasonNumber', (req, res) => {

		//check the title
    var serieImdbId = req.params.serieImdbId;
    if (!serieImdbId || serieImdbId.trim().length == 0) {
        res.status(400).send("Invalid serieImdbId.");
        return;
    }

		//check the season number
    var seasonNumber = Number(req.params.seasonNumber);
    if (isNaN(seasonNumber) || seasonNumber < 1 || seasonNumber % 1 !== 0) {
        res.status(400).send("Invalid season number.");
        return;
    }

    var searchParams = {
        serieImdbId: serieImdbId,
        seasonNumber: seasonNumber
    };

    //Searches for episodes
    Episode.search(searchParams).then((episodes) => {
        if (episodes.length == 0) {
            var msg = "No episodes found (Or you requested an invalid season).";
            res.status(404).send(msg);
            winston.debug(msg, searchParams);
        } else {
            //returns the json
            res.json(episodes);
        }
    }).catch((err) => {
        searchParams.stack = err.stack;
        winston.error("Error searching episodes", searchParams);
        res.status(500).send("Internal error.");
    });
});

module.exports = router;
