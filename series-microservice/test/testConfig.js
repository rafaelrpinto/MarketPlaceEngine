/**
 * Test configuration
 */
function testConfig() {}

//db properties
testConfig.db = {
	//test db url
	uri: "mongodb://localhost/testdb",
	//sets up the connection before the tests
	beforeEach: function(done) {
		if (mongoose.connection.db) {
			return done();
		}
		mongoose.connect(testConfig.db.uri, done);
	}
};


//standard test configurations
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
require('mocha-mongoose')(testConfig.db.uri);

module.exports = testConfig