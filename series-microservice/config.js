"use strict"

/**
 * Configuration object.
 */
var config = {};

//db properties
config.db = {
	uri : "mongodb://" + (process.env.MONGO_HOST || "localhost" ) + ":" + (process.env.MONGO_PORT || "27017") + "/tv-tracker"
};

//log config
config.log = {
	level : (process.env.LOG_LEVEL || "debug" ),
	filename : (process.env.LOG_FILE_NAME || "tv-tracker.log" )
};

module.exports = config;
