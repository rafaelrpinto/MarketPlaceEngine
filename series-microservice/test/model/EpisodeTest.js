"use strict"

/*
	Test case for TvSerie.js
*/
let sinon = require('sinon');
let assert = require("chai").assert;
let should = require("chai").should();
//default test coniguration
let testConfig = require("../testConfig.js");

//victim
let TvSerie = require('../../model/Episode');

//dependencies
let OpenMovieDatabase = require('../../model/OpenMovieDatabase');

describe('Episode.js', () => {
    beforeEach(testConfig.db.beforeEach);

    describe('#toJSON()', (done) => {
        it("TODO", function(done) {
            done();
        });
    });

    describe('#findInDb()', (done) => {
        it("TODO", function(done) {
            done();
        });
    });

    describe('#search()', (done) => {
        it("TODO", function(done) {
            done();
        });
    });
});
