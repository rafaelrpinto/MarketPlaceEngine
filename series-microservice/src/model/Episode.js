"use strict"
const Promise = require("bluebird");
const mongoose = Promise.promisifyAll(require("mongoose"));
const Schema = mongoose.Schema;
let moment = require('moment');
let winston = require('winston');
// model dependencies
let OpenMovieDatabase = require('./OpenMovieDatabase');

let Episode = null;

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
    //we will use imdbid and episode/season number as keys
    delete obj._id;
    delete obj.__v;
    delete obj.lastUpdate;

    return obj
}

// check if this row requires an update from OMDB
episodeSchema.methods.isUpdateRequired = function() {
    //30 days passed from the last update
    //TODO variable time depending if it's currenlty on air
    return moment(this.lastUpdate).add(7, "days").isBefore(moment());
};

// retrieves the episodes from the database
episodeSchema.statics.findInDb = (serieImdbId, seasonNumber) => {
    if (!serieImdbId || !seasonNumber)
        return Promise.resolve(null);

    return Episode.find({serieImdbId: serieImdbId, season: seasonNumber});
}

//Searches for Tv Series Episodes
episodeSchema.statics.search = (searchParams) => {
    return Promise.resolve().then(() => {
        return Episode.findInDb(searchParams.serieImdbId, searchParams.seasonNumber);
    }).then((existingEpisodes) => {
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
                return existingEpisodes;
            }

            winston.debug(`[Serie ${searchParams.serieImdbId} Season ${searchParams.seasonNumber} ] Episodes outdated. Searching on OMDB...`);
        } else {
            //otherwise we go  on and search for them on OMDB
            winston.debug(`[Serie ${searchParams.serieImdbId} Season ${searchParams.seasonNumber} ] Episodes not found in the DB. Searching on OMDB...`);
        }

        return OpenMovieDatabase.searchEpisodes(searchParams.serieImdbId, searchParams.seasonNumber).then((responseBody) => {
            //converts the received data to Episode structure
            let episodes = new Array();

            //data returned by OMDB
            let receivedResults = responseBody.Episodes;

            let updatePromise = Promise.resolve().then(() => {
                //iterate inthe received results
                if (Array.isArray(receivedResults)) {
                    for (let receivedEpisode of receivedResults) {
                        //converts the OMDB structure to out model
                        let episodeData = obdb2mySchema(receivedEpisode);
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
                return episodes;
            });

            //we clear any outdated episodes if necessary
            if (existInDb) {
                winston.debug(`[Serie ${searchParams.serieImdbId} Season ${searchParams.seasonNumber} ] Deleting outdated episodes...`);
                return Episode.remove({serieImdbId: searchParams.serieImdbId, season: searchParams.seasonNumber}).then(updatePromise);
            } else {
                return updatePromise;
            }
        });
    });
};

//helper functions converts from the OMDB structure to Episode schema
function obdb2mySchema(omdbEpisode) {

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

Episode = mongoose.model('episode', episodeSchema);
module.exports = Episode;
