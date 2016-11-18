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


	describe('#findByImdbIds()', () => {
		it("can be listed by imdbId", function(done) {
			var newSeries = generateTvSeries(10);
			var targetIds = ["imdbId1", "imdbId5", "imdbId10", "imdbId99"];
			TvSerie.create(newSeries, (err, model) => {
				if (err) return done(err);
				TvSerie.findByImdbIds(targetIds).then((newOnes) => {
					newOnes.length.should.equal(3);
					for (tvSerie of newOnes) {
						assert(targetIds.indexOf(tvSerie.imdbId) != -1, "The meths returned the id '" + tvSerie.imdbId + "' that was not requested ");
					}
					done();
				}).catch(done);
			});
		});
		it("doesn't break with an empty collection", function(done) {
			TvSerie.findByImdbIds(["imdbId1", "imdbId5", "imdbId10", "imdbId99"]).then((newOnes) => {
				newOnes.length.should.equal(0);
				done();
			}).catch(done);
		});
	});


});

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