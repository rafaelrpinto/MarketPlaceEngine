"use strict"

let TvSerie = require('../model/TvSerie');
let express = require('express');
let router = express.Router();
let winston = require('winston');

/*
	Searches for a TV Series title on OMDB.
*/
router.get('/search/:title/:page*?', (req, res) => {
	let title = req.params.title;

	//check the title
	if (!title || title.trim().length == 0) {
		res.status(400).send("Invalid title.");
		return;
	}

	let page = 1;
	if (req.params.page != null) {
		page = Number(req.params.page);
		if (isNaN(page) || page < 1 || page % 1 !== 0) {
			res.status(400).send("Invalid page number.");
			return;
		}
	}

	let searchParams = {
		title: title,
		page: page
	};

	//Searches for series according to the path parameter
	TvSerie.search(searchParams).then((paginatedResult) => {
		if (paginatedResult.totalResultCount == 0) {
			let msg = "No series found.";
			if (page > 1) {
				msg += " (Or you requested a page that is out of range)"
			}
			res.status(404).send(msg);
			winston.debug(msg, searchParams);
		} else {
			//returns the json
			res.json(paginatedResult);
		}
	}).catch((err) => {
		searchParams.stack = err.stack;
		winston.error("Error searching series by title", searchParams);
		res.status(500).send("Internal error.");
	});
});

/*
	Searches for a TV Series title on OMDB.
*/
router.get('/:imdbId', (req, res) => {
	let imdbId = req.params.imdbId;

	//check the imdbId
	if (!imdbId || imdbId.trim().length == 0) {
		res.status(400).send("Invalid IMDB id.");
		return;
	}

	TvSerie.findByImdbId(imdbId).then((tvSerie) => {
		if (!tvSerie) {
			let msg = "Tv Serie with IMDB id '" + imdbId + "' not found!";
			res.status(404).send(msg);
			winston.debug(msg);
		} else {
			//returns the json
			res.json(tvSerie);
		}
	}).catch((err) => {
		winston.error("Error searching for serie by IMDB id", {
			imdbId: imdbId,
			stack : err.stack
		});
		res.status(500).send("Internal error.");
	});

});


module.exports = router;
