var TvSerie = require('../model/TvSerie');
var express = require('express');
var router = express.Router();
var winston = require('winston');

/*
	Searches for a TV Series title on OMDB.
*/
router.get('/search/:title/:page*?', (req, res) => {
	var title = req.params.title;

	//check the title
	if (!title || title.trim().length == 0) {
		res.status(400).send("Invalid title.");
		return;
	}

	var page = 1;
	if (req.params.page != null) {
		page = Number(req.params.page);
		if (isNaN(page) || page < 1 || page % 1 !== 0) {
			res.status(400).send("Invalid page number.");
			return;
		}
	}

	var searchParams = {
		title: title,
		page: page
	};

	//Searches for series according to the path parameter
	TvSerie.search(searchParams).then((paginatedResult) => {
		if (paginatedResult.totalResultCount == 0) {
			var msg = "No series found.";
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
	var imdbId = req.params.imdbId;

	//check the imdbId
	if (!imdbId || imdbId.trim().length == 0) {
		res.status(400).send("Invalid IMDB id.");
		return;
	}

	TvSerie.findByImdbId(imdbId).then((tvSerie) => {
		if (!tvSerie) {
			var msg = "Tv Serie with IMDB id '" + imdbId + "' not found!";
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