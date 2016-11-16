var httpClient = require('../util/HttpClient');

/*
	Object responsible for interacting with the OMDB api.
*/
function OMDB() {

}

// constants
const OMDB_API_URL = "http://www.omdbapi.com/";

/*
	Searches for a title on OMDB.
*/
OMDB.search = function(searchTerm, searchType) {
	return new Promise(function(resolve, reject) {
		var params = '?s=' + searchTerm + "&type=" + searchType;
		return httpClient.get(OMDB_API_URL, params, function(response) {
			//TODO: convert data type instead of returning whatever omdb gives us
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
					resolve({
						totalResults: 0
					});
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

module.exports = OMDB;