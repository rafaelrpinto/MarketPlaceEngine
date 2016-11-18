var TvSerie = require('../model/TvSerie');
var express = require('express');
var router = express.Router();

/*
	Searches for a TV Series title on OMDB.
*/
router.get('/search/:title/:page*?', (req, res) => {
	var title = req.params.title;

	//check the title
	if (!title || title.trim().length == 0) {
		res.status(400).send("Invalid title");
		return;
	}

	var page = 1;
	if (req.params.page != null) {
		page = Number(req.params.page);
		if (isNaN(page) || page < 1 || page % 1 !== 0) {
			res.status(400).send("Invalid page");
			return;
		}
	}

	//Searches for series according to the path parameter
	TvSerie.search(title, page).then((paginatedResult) => {
		if (paginatedResult.totalResultCount == 0) {
			var msg = "No series found with title '" + title + "'.";
			if (page > 1) {
				msg += " (Or you requested a page that is out of range)"
			}
			res.status(404).send(msg);
		} else {
			//returns the json
			res.json(paginatedResult);
			//saves the new shows after the response
			TvSerie.saveNew(paginatedResult.pageResults).then((newSeries) => {
				console.log("Search added " + newSeries.length + " new series to the db.");
			}).catch((err) => {
				console.log(err);
			});
		}
	}).catch((err) => {
		res.status(500).send("Internal error: " + err);
	});
});

module.exports = router;