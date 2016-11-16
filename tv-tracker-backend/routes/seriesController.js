var express = require('express');
var router = express.Router();
var OMDB = require('../model/OMDB');

const OMDB_SEARCH_TYPE = "series"

/*
	Searches for a TV Seies title on OMDB.
*/
router.get('/search/:title', function(req, res) {
	var title = req.params.title;

	//	TODO: access through Serie model instead of OMDB
	var callback = function(err, response) {
		if (err) {
			res.status(500).send("Internal error: " + err.message);
		} else {
			res.json(response);
		}
	};

	OMDB.search(callback, title, OMDB_SEARCH_TYPE);
});

module.exports = router;