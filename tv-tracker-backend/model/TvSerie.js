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
  posterLink: String,
  metadataComplete: {
    type: Boolean,
    default: false
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  }
});

//Removes some details from the json representation
tvSerieSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj._id;
  delete obj.metadataComplete;
  delete obj.lastUpdate;
  return obj
}

var TvSerie = mongoose.model('TvSerie', tvSerieSchema);

//Searches for Tv Series by title
TvSerie.search = function(searchTerm) {
  return new Promise(function(resolve, reject) {
    OMDB.search(searchTerm, "series").then(function(responseBody) {
      //converts the received data to TvSerie structure
      var searchResults = new Array();

      if (responseBody.Search) {
        for (var i = 0; i < responseBody.Search.length; i++) {
          var searchItem = responseBody.Search[i];
          //igonore N/A posters
          if (searchItem.Poster == "N/A") {
            searchItem.Poster = null;
          }
          //adds the search item to the array
          searchResults.push(new TvSerie({
            title: searchItem.Title,
            imdbId: searchItem.imdbID,
            posterLink: searchItem.Poster
          }));
        }
      }

      resolve({
        results: searchResults,
        totalResults: responseBody.totalResults
      });
    }).catch(reject);
  });
};

module.exports = TvSerie;