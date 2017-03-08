"use strict"
const Promise = require("bluebird");
const mongoose = Promise.promisifyAll(require("mongoose"));
const Schema = mongoose.Schema;
let moment = require('moment');
let winston = require('winston');
// model dependencies
let OpenMovieDatabase = require('./OpenMovieDatabase');
let PaginatedResult = require('./PaginatedResult');

let TvSerie = null;

/*
  Entity that represents a TV Serie.
*/
let tvSerieSchema = new Schema({
    //basic data
    title: String,
    imdbId: {
        type: String,
        index: true
    },
    // additional data
    description: String,
    posterLink: String,
    startYear: Number,
    endYear: Number,
    releaseDate: Date,
    genres: {
        type: Array,
        "default": []
    },
    actors: {
        type: Array,
        "default": []
    },
    director: String,
    writer: String,
    plot: String,
    languages: {
        type: Array,
        "default": []
    },
    country: String,
    imdbRating: Number,
    totalSeasons: Number,
    lastUpdate: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// check if this row requires an update from OMDB
tvSerieSchema.methods.isUpdateRequired = function() {
    //30 days passed from the last update
    return moment(this.lastUpdate).add(30, "days").isBefore(moment());
};

//Removes some details from the json representation and null values
tvSerieSchema.methods.toJSON = function() {
    let obj = this.toObject();
    // we will use imdbid as the external key
    delete obj._id;
    delete obj.__v;
    delete obj.lastUpdate;

    // removes null / empty array values
    for (let field in obj) {
        if (obj[field] === null || (Array.isArray(obj[field]) && obj[field].length == 0)) {
            delete obj[field];
        }
    }

    return obj
}

//Searches for Tv Series by title
tvSerieSchema.statics.search = (searchParams) => {
    return Promise.resolve().then(() => {
        return OpenMovieDatabase.searchSerie(searchParams.title, searchParams.page);
    }).then(function(responseBody) {
        //converts the received data to TvSerie structure
        let searchResults = new Array();

        //data returned by OMDB
        let receivedPageResults = responseBody.Search;
        let receivedTotalResultCount = responseBody.totalResults;

        if (Array.isArray(receivedPageResults)) {
            for (let searchItem of receivedPageResults) {
                //converts and adds the search result to the list
                let tvSerieData = obdb2mySchema(searchItem);
                searchResults.push(new TvSerie(tvSerieData));
            }
        }
        //returns a paginated result
        return new PaginatedResult(searchResults, searchParams.page, receivedTotalResultCount);
    });
};

//Searches for Tv Series by IMDB id
tvSerieSchema.statics.findByImdbId = (imdbId) => {
    return Promise.resolve().then(() => {
        return TvSerie.findByImdbIdInDb(imdbId);
    }).then((existingDbSerie) => {
        let exists = (existingDbSerie != null);

        if (!exists || existingDbSerie.isUpdateRequired()) {
            winston.debug(`[Serie ${imdbId}] Serie isn't in the DB or it's outdated. Fetching from OMDB...`);

            //we search OMDB for it
            return OpenMovieDatabase.findByImdbId(imdbId).then(function(responseBody) {
                if (responseBody) {
                    winston.debug(`[Serie ${imdbId}] Received fresh serie data from OMDB. Saving in the DB..`);

                    //we convert the received result
                    let tvSerieData = obdb2mySchema(responseBody);

                    //if it already exists in the DB
                    if (exists) {
                        winston.debug(`[Serie ${imdbId}] There is already a row in the DB. Updating...`);
                        return existingDbSerie.update(tvSerieData);
                    } else {
                        return new TvSerie(tvSerieData).save();
                    }
                } else {
                    //no result from OMDB
                    winston.debug(`[Serie ${imdbId}] IMDB id not found on OMDB.`);

                    if (exists) {
                        //but we have a row in the db, so we update the updateDate to postpone the next refresh and return out object
                        winston.debug(`[Serie ${imdbId}] Refreshing updateDate and returining existing row...`);
                        return existingDbSerie.update({
                            $set: {
                                lastUpdate: new Date()
                            }
                        });
                    } else {
                        //nothing on OMDB and in our DB
                        return null;
                    }
                }
            });
        } else {
            //existing and up-to-date
            winston.debug(`[Serie ${imdbId}] Found up-to-date entry in the DB. Returning it...`);
            return existingDbSerie;
        }
    })
};

// DB methods retrieves the serie by it's imdb id from the database
tvSerieSchema.statics.findByImdbIdInDb = (imdbId) => {
    if (!imdbId)
        return Promise.resolve(null);
    return TvSerie.findOne({"imdbId": imdbId});
}

//helper functions converts from the OMDB structure to TvSerie schema
function obdb2mySchema(omdbTvSerie) {

    if (!omdbTvSerie) {
        return null;
    }

    //year conversion
    let year = omdbTvSerie.Year;
    let startYear = null;
    let endYear = null;
    if (year) {
        startYear = year.substring(0, 4);
        if (year.length > 5) {
            endYear = year.substring(5);
        }
    }

    //release date conversion
    let releaseDate = null;
    if (omdbTvSerie.Released) {
        releaseDate = moment(omdbTvSerie.Released, "DD MMM YYYY", true).format("YYYY-MM-DD");
    }

    return {
        title: omdbTvSerie.Title,
        imdbId: omdbTvSerie.imdbID,
        posterLink: OpenMovieDatabase.getNullableOmbdFieldValue(omdbTvSerie.Poster),
        startYear: startYear,
        endYear: endYear,
        releaseDate: releaseDate,
        genres: OpenMovieDatabase.getSplitOmbdFieldValue(omdbTvSerie.Genre),
        actors: OpenMovieDatabase.getSplitOmbdFieldValue(omdbTvSerie.Actors),
        director: OpenMovieDatabase.getNullableOmbdFieldValue(omdbTvSerie.Director),
        writer: OpenMovieDatabase.getNullableOmbdFieldValue(omdbTvSerie.Writer),
        plot: OpenMovieDatabase.getNullableOmbdFieldValue(omdbTvSerie.Plot),
        languages: OpenMovieDatabase.getSplitOmbdFieldValue(omdbTvSerie.Language),
        country: OpenMovieDatabase.getNullableOmbdFieldValue(omdbTvSerie.Country),
        imdbRating: OpenMovieDatabase.getNullableOmbdFieldValue(omdbTvSerie.imdbRating),
        totalSeasons: OpenMovieDatabase.getNullableOmbdFieldValue(omdbTvSerie.totalSeasons),
        lastUpdate: new Date()
    };
}

TvSerie = mongoose.model('tvSerie', tvSerieSchema);
module.exports = TvSerie;
