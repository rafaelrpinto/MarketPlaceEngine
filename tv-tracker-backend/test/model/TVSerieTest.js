/*
	Test case for TvSerie.js
*/
var sinon = require('sinon');
var assert = require("chai").assert;
var should = require("chai").should;

//victim
var TvSerie = require('../../model/TvSerie');
//dependencies to mock
var OpenMovieDatabase = require('../../model/OpenMovieDatabase');


describe('TvSerie.js', () => {
	describe('#toJSON()', () => {
		it('Json without metadata', () => {
			var serie = new TvSerie({
				title: "Some tile",
				imdbId: "Some id",
				posterLink: "some link"
			});
			var expectedJson = '{"title":"Some tile","imdbId":"Some id","posterLink":"some link"}';
			var generatedJson = JSON.stringify(serie);
			assert(expectedJson == generatedJson, "Unexpected json generated");

		});
		//TODO: other tests
	});
});