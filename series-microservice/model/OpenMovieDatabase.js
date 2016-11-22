var httpClient = require('../util/HttpClient');

/*
	Object responsible for interacting with the OMDB api.
*/
function OpenMovieDatabase() {

}

// constants
const OMDB_API_URL = "http://www.omdbapi.com/";

/*
	Searches for a title on OMDB.
*/
OpenMovieDatabase.search = (searchTerm, searchType, page) => {

	//TODO: basic validation of the received params

	return new Promise((resolve, reject) => {
		var params = '?s=' + searchTerm + "&type=" + searchType + "&page=" + page;
		return httpClient.get(OMDB_API_URL, params, (response) => {
			parseOmdbResponse(response, resolve, reject);
		});

	});
}

/*
	Retrieves a title by it's IMDB id.
*/
OpenMovieDatabase.findByImdbId = (imdbId) => {

	//TODO: basic validation of the received params

	return new Promise((resolve, reject) => {
		var params = '?i=' + imdbId;
		return httpClient.get(OMDB_API_URL, params, (response) => {
			parseOmdbResponse(response, resolve, reject);
		});

	});
}

/*
	Private function to apply the same processing/validation to all OMDB responses.
*/
function parseOmdbResponse(response, resolve, reject) {
	try {
		if (response.error) {
			throw "Error executing OMDB request : '" + response.error.code + "'";
		} else if (response.status > 399) {
			throw "OMDB returned http error code: " + response.status;
		} else {
			var responseContentType = response.headers["content-type"];
			if (!responseContentType || responseContentType.indexOf("application/json") == -1) {
				throw "OMDB returned an invalid content type :'" + responseContentType + "'";
			} else if (response.body.Error) {
				if (response.body.Error == "Movie not found!") {
					//no resutls, but no internal error
					resolve({ totalResults: 0 });
				} if (response.body.Error == "Incorrect IMDb ID.") {
					//no resutls, but no internal error
					resolve(null);
				} else {
					throw "OMDB returned an error message : '" + response.body.Error + "'";
				}
			} else {
				//success
				resolve(response.body);
			}
		}
	} catch (e) {
		//fail
		reject(e);
	}
}

module.exports = OpenMovieDatabase;