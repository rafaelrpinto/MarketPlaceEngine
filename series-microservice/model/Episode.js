"use strict"

//db libs
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// model dependencies
var OpenMovieDatabase = require('./OpenMovieDatabase');
// util libs
var moment = require('moment');
var winston = require('winston');


const NO_DATA_FIELD_VALUE = "N/A";

/*
  Entity that represents a TV Serie Episode.
*/
var episodeSchema = new Schema({
  //basic data
  title: String,
  imdbId: {
    type: String,
    index: true
  },
  releaseDate: Date,
  imdbRating: Number,
  episodeNumber: Number
});


//Removes some details from the json representation and null values
episodeSchema.methods.toJSON = function() {
  var obj = this.toObject();
  //removes intenal details
  delete obj._id;
  delete obj.__v;
  return obj
}

var Episode = mongoose.model('episode', episodeSchema);

//Searches for Tv Series Episodes
Episode.search = (searchParams) => {
  return new Promise(function(resolve, reject) {
    OpenMovieDatabase.searchEpisodes(searchParams.serieImdbId, searchParams.seasonNumber).then(function(responseBody) {
      //converts the received data to Episode structure
      var episodes = new Array();

      //data returned by OMDB
      var receivedResults = responseBody.Episodes;
      var receivedTotalResultCount = responseBody.totalResults;

      if (Array.isArray(receivedResults)) {
        for (let episode of receivedResults) {
          //converts and adds the result to the list
          var episodeData = obdb2schema(episode);
          episodes.push(new Episode(episodeData));
        }
      }
      //returns the episode list
      resolve(episodes);
    }).catch(reject);
  });
};

//helper functions

// converts from the OMDB structure to Episode schema
function obdb2schema(omdbEpisode) {

  if (!omdbEpisode) {
    return null;
  }

  //release date conversion
  var releaseDate = null;
  if (omdbEpisode.Released) {
    releaseDate = new Date(omdbEpisode.Released);
  }

  return {
    title: omdbEpisode.Title,
    imdbId: omdbEpisode.imdbID,
    releaseDate: releaseDate,
    imdbRating: getNullableOmbdFieldValue(omdbEpisode.imdbRating),
    episodeNumber: omdbEpisode.Episode
  };
}

// gets a nullable value
// TODO reuse this function on TvSerie and Episode
function getNullableOmbdFieldValue(field) {
  if (field && field != NO_DATA_FIELD_VALUE) {
    return field;
  }
  return null;
}

module.exports = Episode;
