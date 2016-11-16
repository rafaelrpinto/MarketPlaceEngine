var unirest = require('unirest');

function OMDB() {

}

/*
	Searches for a title on OMDB.
	//TODO: error handling, unit tests,...
*/
OMDB.search = function(callback, searchTerm, searchType) {
	unirest.get('http://www.omdbapi.com/?s=' + searchTerm + '&type=' + searchType)
		.headers({
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		})
		.end(function(response) {
			//console.log(response.body);
			callback(response.body);
		});
}

module.exports = OMDB;