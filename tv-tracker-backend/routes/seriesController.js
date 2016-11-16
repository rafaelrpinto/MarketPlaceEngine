var express = require('express');
var router = express.Router();
var OMDB = require('../model/OMDB');

const OMDB_SEARCH_TYPE = "series"

/*
	Searches for a TV Seies title on OMDB.
	TODO: move this to the model
*/
router.get('/search/:title', function(req, res) {
	var title = req.params.title;

	console.log(OMDB);

	var callback = function(response) {
		//TODO: error handling
		res.json(response);
	};

	OMDB.search(callback, title, OMDB_SEARCH_TYPE);
});

module.exports = router;