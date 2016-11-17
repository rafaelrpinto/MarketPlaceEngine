var TvSerie = require('../model/TvSerie');
var express = require('express');
var router = express.Router();


/*
	Searches for a TV Series title on OMDB.
*/
router.get('/search/:title/:page*?', function(req, res) {
	var title = req.params.title;

	//check the title
	if (!title || title.trim().length == 0) {
		res.status(400).send("Invalid title");
		return;
	}

	//TODO: use page param

	//Searches for series according to the path parameter
	TvSerie.search(title).then(function(response) {
		if (response.totalResults == 0) {
			res.status(404).send("No series found with title '" + title + "'");	
		} else {
			res.json(response);	
		}
	}).catch(function(err) {
		res.status(500).send("Internal error: " + err);
	});
});

module.exports = router;