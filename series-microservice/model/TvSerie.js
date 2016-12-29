"use strict"

//db libs
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// model dependencies
var OpenMovieDatabase = require('./OpenMovieDatabase');
var PaginatedResult = require('./PaginatedResult');
// util libs
var moment = require('moment');
var winston = require('winston');

/*
  Entity that represents a TV Serie.
*/
var tvSerieSchema = new Schema({
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
  var obj = this.toObject();
  //removes intenal details
  delete obj._id;
  delete obj.__v;
  delete obj.lastUpdate;

  // removes null / empty array values
  for (var field in obj) {
    if (obj[field] === null || (Array.isArray(obj[field]) && obj[field].length == 0)) {
      delete obj[field];
    }
  }

  return obj
}

var TvSerie = mongoose.model('tvSerie', tvSerieSchema);

//Searches for Tv Series by title
TvSerie.search = (searchParams) => {
  return new Promise(function(resolve, reject) {
    OpenMovieDatabase.searchSerie(searchParams.title, searchParams.page).then(function(responseBody) {
      //converts the received data to TvSerie structure
      var searchResults = new Array();

      //data returned by OMDB
      var receivedPageResults = responseBody.Search;
      var receivedTotalResultCount = responseBody.totalResults;

      if (Array.isArray(receivedPageResults)) {
        for (let searchItem of receivedPageResults) {
          //converts and adds the search result to the list
          var tvSerieData = obdb2schema(searchItem);
          searchResults.push(new TvSerie(tvSerieData));
        }
      }
      //returns a paginated result
      resolve(new PaginatedResult(searchResults, searchParams.page, receivedTotalResultCount));
    }).catch(reject);
  });
};

//Searches for Tv Series by IMDB id
TvSerie.findByImdbId = (imdbId) => {
  return new Promise(function(resolve, reject) {
    //search the imdb id in the database
    TvSerie.findByImdbIdInDb(imdbId).then((existingDbSerie) => {
      var exists = (existingDbSerie != null);
      //if it it does not exists or is outdated
      if (!exists || existingDbSerie.isUpdateRequired()) {
        winston.debug("[" + imdbId + "] Serie isn't in the DB or it's outdated. Fetching from OMDB...");
        //we search OMDB for it
        OpenMovieDatabase.findByImdbId(imdbId).then(function(responseBody) {
          if (responseBody) {
            winston.debug("[" + imdbId + "] Received fresh serie data from OMDB. Saving in the DB...");

            //we convert the received result
            var tvSerieData = obdb2schema(responseBody);

            //if it already exists in the DB
            if (exists) {
              winston.debug("[" + imdbId + "] There is already a row in the DB. Updating...");
              existingDbSerie.update(tvSerieData).then(() => {
                resolve(existingDbSerie);
              }).catch(reject);
            } else {
              new TvSerie(tvSerieData).save().then(resolve).catch(reject);
            }
          } else {
            //no result from OMDB
            winston.debug("[" + imdbId + "] IMDB id not found on OMDB.");

            if (exists) {
              //but we have a row in the db, so we update the updateDate to postpone the next refresh and return out object
              winston.debug("[" + imdbId + "] Refreshing updateDate and returining existing row...");
              existingDbSerie.update({
                $set: {
                  lastUpdate: new Date()
                }
              }).then(resolve).catch(reject);
            } else {
              //nothing on OMDB and our DB
              resolve(null);
            }
          }
        }).catch(reject);
      } else {
        //existing and up-to-date
        winston.debug("[" + imdbId + "] Found up-to-date entry in the DB. Returning it...");
        resolve(existingDbSerie);
      }
    }).catch(reject);
  });
};

// DB methods

// retrieves the serie by it's imdb id from the database
TvSerie.findByImdbIdInDb = (imdbId) => {
  return new Promise((resolve, reject) => {
    if (!imdbId) {
      reject("Invalid paameter for findByImdbIdsInDb");
    } else {
      TvSerie.findOne({
        "imdbId": imdbId
      }).exec().then((result) => {
        resolve(result);
      }).catch(reject);
    }
  });
}

//helper functions

// converts from the OMDB structure to TvSerie schema
function obdb2schema(omdbTvSerie) {

  if (!omdbTvSerie) {
    return null;
  }

  //year conversion
  var year = omdbTvSerie.Year;
  var startYear = null;
  var endYear = null;
  if (year) {
    startYear = year.substring(0, 4);
    if (year.length > 5) {
      endYear = year.substring(5);
    }
  }

  //release date conversion
  var releaseDate = null;
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

module.exports = TvSerie;
