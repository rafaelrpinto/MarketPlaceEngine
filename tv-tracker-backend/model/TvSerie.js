var OMDB = require('./OMDB');
var PaginatedResult = require('./PaginatedResult');
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
TvSerie.search = function(searchTerm, page) {
  return new Promise(function(resolve, reject) {
    OMDB.search(searchTerm, "series", page).then(function(responseBody) {
      //converts the received data to TvSerie structure
      var searchResults = new Array();

      //data returned by OMDB
      var receivedPageResults = responseBody.Search;
      var receivedTotalResultCount = responseBody.totalResults;


      if (Array.isArray(receivedPageResults)) {
        for (var i = 0; i < receivedPageResults.length; i++) {
          var searchItem = receivedPageResults[i];
          //igonore N/A posters
          if (searchItem.Poster == "N/A") {
            searchItem.Poster = null;
          }

          //converts and adds the search result to the list
          searchResults.push(new TvSerie({
            title: searchItem.Title,
            imdbId: searchItem.imdbID,
            posterLink: searchItem.Poster
          }));
        }
      }
      //returns a paginated result
      resolve(new PaginatedResult(searchResults, page, receivedTotalResultCount));
    }).catch(reject);
  });
};

module.exports = TvSerie;