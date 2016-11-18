/*
	Test case for TvSerie.js
*/
var sinon = require('sinon');
var assert = require("chai").assert;
var should = require("chai").should();

//mongo config
//TODO: try to avoid having this configuration en every model test
var dbURI = "mongodb://localhost/testdb";
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var clearDB = require('mocha-mongoose')(dbURI);

//victim
var TvSerie = require('../../model/TvSerie');

describe('TvSerie.js', () => {
	beforeEach(function(done) {
		if (mongoose.connection.db) return done();

		mongoose.connect(dbURI, done);
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
			new TvSerie({
				title: "Some tile",
				imdbId: "Some id",
				posterLink: "some link"
			}).save(function(err, model) {
				if (err) return done(err);

				new TvSerie({
					title: "Some other tile",
					imdbId: "Some other id",
					posterLink: "some other link"
				}).save(function(err, model) {
					if (err) return done(err);
					TvSerie.find({}, function(err, docs) {
						if (err) return done(err);
						docs.length.should.equal(2);
						done();
					});
				});
			});
		});
	});


	describe('#toJSON()', () => {
		it('should generate json without metadata', () => {
			var serie = new TvSerie({
				title: "Some tile",
				imdbId: "Some id",
				posterLink: "some link"
			});
			var expectedJson = '{"title":"Some tile","imdbId":"Some id","posterLink":"some link"}';
			var generatedJson = JSON.stringify(serie);
			assert(expectedJson == generatedJson, "Unexpected json generated");
		});
	});
});