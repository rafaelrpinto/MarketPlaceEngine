/**
 * Configuration object.
 */
var config = {};

//db properties
config.db = {
	uri : "mongodb://localhost:27017/tv-tracker"
};

//log config
config.log = {
	level : "debug",
	filename : "tv-tracker.log"
};

module.exports = config;
