var OpenMovieDatabase = require('./OpenMovieDatabase');
var PaginatedResult = require('./PaginatedResult');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
  Entity that represents a TV Serie.
*/
var tvSerieSchema = new Schema({
  title: String,
  imdbId: {
    type: String,
    index: true
  },
  description: String,
  posterLink: String,
  metadataComplete: {
    type: Boolean,
    default: false,
    index: true
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
    index: true
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

var TvSerie = mongoose.model('tvSerie', tvSerieSchema);

//Searches for Tv Series by title
TvSerie.search = function(searchTerm, page) {
  return new Promise(function(resolve, reject) {
    OpenMovieDatabase.search(searchTerm, "series", page).then(function(responseBody) {
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

// inserts the tv shows thar aren't already in the database.
TvSerie.insertNew = function(newOrExistingTvSeries) {
  TvSerie.find({
    "imdbId": {
      $in: toImdbIdArray(newOrExistingTvSeries)
    }
  }).exec((err, existingTvSeries) => {
    if (err) {
      console.log("Error searching for series with ids: " + idArray);
    } else {
      //FIXME: replace with selector
      var existingImdbIds = toImdbIdArray(existingTvSeries);
      for (let tvSerie of newOrExistingTvSeries) {
        //if the current imdb id is not in the db....
        if (existingImdbIds.indexOf(tvSerie.imdbId) == -1) {
          //new serie, insert...
          tvSerie.save(function(err) {
            if (err) {
              console.log("Error saving " + tvSerie.imdbId + ": " + err);
            } else {
              console.log("Saving " + tvSerie.imdbId + "...");
            }
          });
        }
      }
    }
  });
}

//creates an array with the imdb ids
function toImdbIdArray(tvSeries) {
  var idArray = new Array();
  for (let tvSerie of tvSeries) {
    idArray.push(tvSerie.imdbId);
  }
  return idArray;
}

module.exports = TvSerie;