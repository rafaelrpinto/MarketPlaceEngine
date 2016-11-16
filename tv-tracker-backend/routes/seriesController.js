var express = require('express');
var router = express.Router();
var Promise = require("bluebird");
var OMDB = Promise.promisifyAll(require('../model/OMDB'));

/*
	Searches for a TV Series title on OMDB.
*/
router.get('/search/:title', function(req, res) {
	var title = req.params.title;

	//	TODO: access through Serie model instead of OMDB
	OMDB.search(title, "series").then(function(response) {
		res.json(response);
	}).catch(function(err) {
		res.status(500).send("Internal error: " + err);
	});
});

module.exports = router;