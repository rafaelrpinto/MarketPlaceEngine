/**
 * Configuration object.
 */
var config = {};

//db properties
config.db = {
	uri : "mongodb://" + (process.env.MONGO_HOST || "localhost" ) + ":" + (process.env.MONGO_HOST || "27017") + "/tv-tracker"
};

//log config
config.log = {
	level : "debug",
	filename : "tv-tracker.log"
};

module.exports = config;
