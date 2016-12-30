"use strict"

let httpClient = require('../util/HttpClient');

/*
	Object responsible for interacting with the OMDB api.
*/
function OpenMovieDatabase() {

}

// constants
const OMDB_API_URL = "http://www.omdbapi.com/";
const NO_DATA_FIELD_VALUE = "N/A";

/*
	Searches for a Tv Serie on  OMDB.
*/
OpenMovieDatabase.searchSerie = (searchTerm, page) => {
	return new Promise((resolve, reject) => {
		let params = '?s=' + searchTerm + "&type=series&page=" + page;
		return httpClient.get(OMDB_API_URL, params, (response) => {
			parseOmdbResponse(response, resolve, reject);
		});
	});
}

/*
	Searches for Tv Serie Episodes on  OMDB.
*/
OpenMovieDatabase.searchEpisodes = (serieImdbId, seasonNumber) => {
	return new Promise((resolve, reject) => {
		let params = '?i=' + serieImdbId + "&Season=" + seasonNumber;
		return httpClient.get(OMDB_API_URL, params, (response) => {
			parseOmdbResponse(response, resolve, reject);
		});
	});
}


/*
	Retrieves a title by it's IMDB id.
*/
OpenMovieDatabase.findByImdbId = (imdbId) => {
	return new Promise((resolve, reject) => {
		let params = '?i=' + imdbId;
		return httpClient.get(OMDB_API_URL, params, (response) => {
			parseOmdbResponse(response, resolve, reject);
		});

	});
}

// gets an array from a field value
OpenMovieDatabase.getSplitOmbdFieldValue = (field) => {
	//FIXME trim each entry
  if (field && field != NO_DATA_FIELD_VALUE) {
    return field.split(",");
  }
  return [];
}

// gets a nullable value
OpenMovieDatabase.getNullableOmbdFieldValue = (field) => {
  if (field && field != NO_DATA_FIELD_VALUE) {
    return field;
  }
  return null;
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
			let responseContentType = response.headers["content-type"];
			if (!responseContentType || responseContentType.indexOf("application/json") == -1) {
				throw "OMDB returned an invalid content type :'" + responseContentType + "'";
			} else if (response.body.Error) {
				if (response.body.Error == "Movie not found!" || response.body.Error == "Series or season not found!") {
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
