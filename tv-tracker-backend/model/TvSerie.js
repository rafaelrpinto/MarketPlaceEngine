var OMDB = require('../model/OMDB');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
  Entity that represents a TV Serie.
*/

var tvSerieSchema = new Schema({
  title: String,
  imdbId: String,
  description: String,
  metadataComplete: {
    type: Boolean,
    default: false
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  }
});

var TvSerie = mongoose.model('TvSerie', tvSerieSchema);

//Searches for Tv Series by title
TvSerie.search = function(searchTerm) {
  return OMDB.search(searchTerm, "series");
};

module.exports = TvSerie;