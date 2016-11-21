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
TvSerie.search = (searchParams) => {
  return new Promise(function(resolve, reject) {
    OpenMovieDatabase.search(searchParams.title, "series", searchParams.page).then(function(responseBody) {
      //converts the received data to TvSerie structure
      var searchResults = new Array();

      //data returned by OMDB
      var receivedPageResults = responseBody.Search;
      var receivedTotalResultCount = responseBody.totalResults;

      if (Array.isArray(receivedPageResults)) {
        for (searchItem of receivedPageResults) {
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
      resolve(new PaginatedResult(searchResults, searchParams.page, receivedTotalResultCount));
    }).catch(reject);
  });
};

// retrieves the series by their imdb id
TvSerie.findByImdbIds = (imdbIds) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(imdbIds)) {
      reject("Invalid paameter for findByImdbIds");
    } else {
      TvSerie.find({
        "imdbId": {
          $in: imdbIds
        }
      }).exec().then((results) => {
        resolve(results);
      }).catch(reject);
    }
  });
}

// inserts the tv shows thar aren't already in the database.
TvSerie.saveNew = (newOrExistingTvSeries) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(newOrExistingTvSeries)) {
      reject("saveNew only accepts arrays.(" + newOrExistingTvSeries + ")");
    } else {
      TvSerie.findByImdbIds(toImdbIdArray(newOrExistingTvSeries)).then((existingTvSeries) => {
        var newSeries = new Array();
        var existingImdbIds = toImdbIdArray(existingTvSeries);
        for (tvSerie of newOrExistingTvSeries) {
          //if the current imdb id is not in the db....
          if (existingImdbIds.indexOf(tvSerie.imdbId) == -1) {
            //new serie, insert...
            tvSerie.save().catch((err) => {
              reject("Error saving serie with imdb id: " + tvSerie.imdbId + ": " + err);
            });
            newSeries.push(tvSerie);
          }
        }
        resolve(newSeries);
      }).catch(reject);
    }
  });
}

//creates an array with the imdb ids
function toImdbIdArray(tvSeries) {
  var idArray = new Array();
  for (tvSerie of tvSeries) {
    idArray.push(tvSerie.imdbId);
  }
  return idArray;
}

module.exports = TvSerie;