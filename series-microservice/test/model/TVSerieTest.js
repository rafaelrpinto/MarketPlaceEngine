"use strict"

/*
	Test case for TvSerie.js
*/
var sinon = require('sinon');
var assert = require("chai").assert;
var should = require("chai").should();
//default test coniguration
var testConfig = require("../testConfig.js");

//victim
var TvSerie = require('../../model/TvSerie');

//dependencies
var OpenMovieDatabase = require('../../model/OpenMovieDatabase');
var PaginatedResult = require('../../model/PaginatedResult');

describe('TvSerie.js', () => {
	beforeEach(testConfig.db.beforeEach);

	describe('#toJSON()', () => {
		it('should generate json without metadata / null fields', (done) => {
			var serie = new TvSerie({
				title: "Some tile",
				imdbId: "Some id",
				posterLink: null,
				actors : []
			});
			var expectedJson = '{"title":"Some tile","imdbId":"Some id"}';
			var generatedJson = JSON.stringify(serie);
			assert(expectedJson == generatedJson, "Unexpected json generated");
			done();
		});
	});

	describe('#save()', () => {
		it("can be saved", function(done) {
			new TvSerie({
				title: "Some tile",
				imdbId: "Some id",
				posterLink: "some link"
			}).save(done);
		});
	});

	describe('#find()', () => {
		it("can be listed", function(done) {
			var newSeries = generateTvSeries(2);
			TvSerie.create(newSeries, (err, model) => {
				if (err) return done(err);
				TvSerie.find({}, function(err, docs) {
					if (err) return done(err);
					docs.length.should.equal(2);
					done();
				});
			});
		});
	});

	describe('#search()', () => {
	});

	describe('#findByImdbId()', (done) => {
	});

});

//mocks the http client to return a specific response
function mockOMDBResponse(response) {

	//removes the previous mock to use a different response
	if (OpenMovieDatabase.search.restore) {
		OpenMovieDatabase.search.restore();
	}

	//forces httpClient.get to always return the specified response
	sinon.stub(OpenMovieDatabase, 'search', (title, type, page, callback) => {
		callback(response);
	});
}

//generates tv series
function generateTvSeries(quantity) {
	var result = new Array();
	for (let i = 1; i <= quantity; i++) {
		result.push(new TvSerie({
			title: "title" + i,
			imdbId: "imdbId" + i,
			posterLink: "link" + i
		}));
	}
	return result;
}
