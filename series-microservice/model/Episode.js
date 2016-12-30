"use strict"

//db libs
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
// model dependencies
let OpenMovieDatabase = require('./OpenMovieDatabase');
// util libs
let moment = require('moment');
let winston = require('winston');

/*
  Entity that represents a TV Serie Episode.
*/
let episodeSchema = new Schema({
    //basic data
    title: String,
    imdbId: {
        type: String,
        index: true
    },
    serieImdbId: {
        type: String,
        index: true
    },
    releaseDate: Date,
    imdbRating: Number,
    episodeNumber: Number,
    season: Number,
    lastUpdate: {
        type: Date,
        default: Date.now,
        index: true
    }
});

//Removes some details from the json representation and null values
episodeSchema.methods.toJSON = function() {
    let obj = this.toObject();
    //removes intenal details
    delete obj._id;
    delete obj.__v;
    delete obj.lastUpdate;

    return obj
}

// check if this row requires an update from OMDB
episodeSchema.methods.isUpdateRequired = function() {
    //30 days passed from the last update
    return moment(this.lastUpdate).add(30, "days").isBefore(moment());
};

let Episode = mongoose.model('episode', episodeSchema);

// retrieves the episodes from the database
Episode.findIdInDb = (serieImdbId, seasonNumber) => {
    return new Promise((resolve, reject) => {
        Episode.find({serieImdbId: serieImdbId, season: seasonNumber}).exec().then((episodes) => {
            resolve(episodes);
        }).catch(reject);
    });
}

//Searches for Tv Series Episodes
Episode.search = (searchParams) => {
    return new Promise(function(resolve, reject) {
        //first we try to get the episodes from the DB
        Episode.findIdInDb(searchParams.serieImdbId, searchParams.seasonNumber).then((existingEpisodes) => {
            let existInDb = (existingEpisodes && existingEpisodes.length > 0);

            //if they exist we check if they are up-to-date
            if (existInDb) {
                let updateRequired = false;
                for (let existingEpisode of existingEpisodes) {
                    if (existingEpisode.isUpdateRequired()) {
                        updateRequired = true;
                        break;
                    }
                }

                if (!updateRequired) {
                    winston.debug(`[Serie ${searchParams.serieImdbId} Season ${searchParams.seasonNumber} ] Found up-to-date entries in the DB, returning them...`);
                    resolve(existingEpisodes);
                    //no need to search on OMDB, we leave the method here
                    return;
                }

                winston.debug(`[Serie ${searchParams.serieImdbId} Season ${searchParams.seasonNumber} ] Episodes outdated. Searching on OMDB...`);
            } else {
                //otherwise we go  on and search for them on OMDB
                winston.debug(`[Serie ${searchParams.serieImdbId} Season ${searchParams.seasonNumber} ] Episodes not found in the DB. Searching on OMDB...`);
            }

            OpenMovieDatabase.searchEpisodes(searchParams.serieImdbId, searchParams.seasonNumber).then(function(responseBody) {
                //converts the received data to Episode structure
                let episodes = new Array();

                //data returned by OMDB
                let receivedResults = responseBody.Episodes;
                let receivedTotalResultCount = responseBody.totalResults;

                //we clear any outdated episodes if necessary
                if (existInDb) {

                    winston.debug(`[Serie ${searchParams.serieImdbId} Season ${searchParams.seasonNumber} ] Deleting outdated episodes...`);
                    Episode.remove({serieImdbId: searchParams.serieImdbId, season: searchParams.seasonNumber}).exec();
                }

                //iterate inthe received results
                if (Array.isArray(receivedResults)) {
                    for (let receivedEpisode of receivedResults) {
                        //converts the OMDB structure to out model
                        let episodeData = obdb2schema(receivedEpisode);
                        episodeData.serieImdbId = searchParams.serieImdbId;
                        episodeData.season = searchParams.seasonNumber;

                        //save in the DB
                        let episode = new Episode(episodeData);
                        episode.save();

                        //adds to the return list
                        episodes.push(episode);
                    }
                }

                //returns the episode list
                winston.debug(`[Serie ${searchParams.serieImdbId} Season ${searchParams.seasonNumber} ] OMDB returned ${episodes.length} episodes...`);
                resolve(episodes);
            }).catch(reject);

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
    let releaseDate = null;
    if (omdbEpisode.Released) {
        releaseDate = new Date(omdbEpisode.Released);
    }

    return {
        title: omdbEpisode.Title,
        imdbId: omdbEpisode.imdbID,
        releaseDate: releaseDate,
        imdbRating: OpenMovieDatabase.getNullableOmbdFieldValue(omdbEpisode.imdbRating),
        episodeNumber: omdbEpisode.Episode
    };
}

module.exports = Episode;
