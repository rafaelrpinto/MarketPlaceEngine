"use strict"
const Promise = require("bluebird");
let request = Promise.promisify(require("request"));

/*
	Class responsible for interacting with the OMDB api.
*/
class OpenMovieDatabase {}

// constants
const OMDB_API_URL = "http://www.omdbapi.com";
const NO_DATA_FIELD_VALUE = "N/A";

/**
 * Searches for a Tv Serie on  OMDB.
 * @param  {String} searchTerm 	Text to be searched for.
 * @param  {Number} page       	Pagination's page number.
 * @return {Promise}            A promise to resolve the search response.
 */
OpenMovieDatabase.searchSerie = (searchTerm, page) => {
    return request({method: 'GET', json: true, uri: `${OMDB_API_URL}?s=${searchTerm}&type=series&page=${page}`}).then((response) => {
        if (response.statusCode != 200)
            throw new Error(`OMDB returned status ${response.statusCode} for searchTerm ${searchTerm}`);
        return parseOmdbResponse(response);
    });
}

/**
 * Searches for Tv Serie Episodes on  OMDB.
 * @param  {String} serieImdbId  	Imdb ID of the serie.
 * @param  {Number} seasonNumber 	Season number.
 * @return {Promise}              A promise to reqtrieve the episodes.
 */
OpenMovieDatabase.searchEpisodes = (serieImdbId, seasonNumber) => {
    return request({method: 'GET', json: true, uri: `${OMDB_API_URL}?i=${serieImdbId}&Season=${seasonNumber}`}).then((response) => {
        if (response.statusCode != 200)
            throw new Error(`OMDB returned status ${response.statusCode} for serieImdbId ${serieImdbId} and season ${seasonNumber}`);
        return parseOmdbResponse(response);
    });
}

/*
	Retrieves a title by it's IMDB id.
*/
OpenMovieDatabase.findByImdbId = (imdbId) => {
    return request({method: 'GET', json: true, uri: `${OMDB_API_URL}?i=${imdbId}`}).then((response) => {
        if (response.statusCode != 200)
            throw new Error(`OMDB returned status ${response.statusCode} for imdbId ${imdbId}`);
        return parseOmdbResponse(response);
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
function parseOmdbResponse(response) {
    if (response.body.Error) {
        if (response.body.Error == "Movie not found!" || response.body.Error == "Series or season not found!") {
            //no resutls, but no internal error
            return {totalResults: 0};
        }
        if (response.body.Error == "Incorrect IMDb ID.") {
            //no resutls, but no internal error
            return null;
        } else {
            throw "OMDB returned an error message : '" + response.body.Error + "'";
        }
    } else {
        //success
        return response.body;
    }
}

module.exports = OpenMovieDatabase;
