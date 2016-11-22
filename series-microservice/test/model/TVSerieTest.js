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

describe('TvSerie.js', () => {
	beforeEach(testConfig.db.beforeEach);

	describe('#toJSON()', () => {
		it('should generate json without metadata', (done) => {
			var serie = new TvSerie({
				title: "Some tile",
				imdbId: "Some id",
				posterLink: "some link"
			});
			var expectedJson = '{"title":"Some tile","imdbId":"Some id","posterLink":"some link"}';
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


	describe('#findByImdbIdsInDb()', () => {
		it("can be listed by imdbId", function(done) {
			var newSeries = generateTvSeries(10);
			var targetIds = ["imdbId1", "imdbId5", "imdbId10", "imdbId99"];
			TvSerie.create(newSeries).then((model) => {
				TvSerie.findByImdbIdsInDb(targetIds).then((newOnes) => {
					newOnes.length.should.equal(3);
					for (tvSerie of newOnes) {
						assert(targetIds.indexOf(tvSerie.imdbId) != -1, "The meths returned the id '" + tvSerie.imdbId + "' that was not requested ");
					}
					done();
				}).catch(done);
			}).catch(done);
		});

		it("doesn't break with an empty collection", function(done) {
			TvSerie.findByImdbIdsInDb(["imdbId1", "imdbId5", "imdbId10", "imdbId99"]).then((newOnes) => {
				newOnes.length.should.equal(0);
				done();
			}).catch(done);
		});
	});

	describe('#saveNew()', () => {
		it("should save only the new items", function(done) {
			var genSeries = generateTvSeries(10);
			var genExisting = genSeries.splice(0,5);
			var genNew = genSeries.splice(5);

			TvSerie.create(genExisting).then((model) => {
				TvSerie.saveNew(genSeries).then((newSeries) => {
					for(genSerie of genNew) {
						var found = false;
						for(newSerie of newSeries) {
							if(genSerie.imdbId == newSerie.imdbId) {
								found = true;
								break;
							}
						}
						assert(found, "Should have found the imdbId '" + genSerie.imdbId + "' on the new series list.");
					}
					done();
				}).catch(done);
			}).catch(done);
		});
	});

	//TODO: more tests with invalid parameters
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