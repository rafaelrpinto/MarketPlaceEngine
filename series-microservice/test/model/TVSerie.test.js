"use strict"
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
//default test coniguration
let testConfig = require("../testConfig.js");

//victim
let TvSerie = require('../../src/model/TvSerie');

describe('TvSerie.js', () => {
    beforeEach(testConfig.db.beforeEach);

    describe('#toJSON()', () => {
        it('should generate json without metadata / null fields', (done) => {
            let serie = new TvSerie({title: "Some tile", imdbId: "Some id", posterLink: null, actors: []});
            let expectedJson = '{"title":"Some tile","imdbId":"Some id"}';
            JSON.stringify(serie).should.be.equals(expectedJson)
            done();
        });
    });

    describe('#save()', () => {
        it("can be saved", function(done) {
            //TODO assert persisted fields
            new TvSerie({title: "Some tile", imdbId: "Some id", posterLink: "some link"}).save().should.be.fulfilled.and.notify(done);
        });
    });

    describe('#find()', () => {
        it("can be listed", function(done) {
            TvSerie.create(generateTvSeries(2)).then(() => {
                return TvSerie.find({});
            }).then((docs) => {
                docs.should.be.lengthOf(2);
            }).should.be.fulfilled.and.notify(done);
        });
    });

    //TODO more tests
});

//generates tv series
function generateTvSeries(quantity) {
    let result = new Array();
    for (let i = 1; i <= quantity; i++) {
        result.push(new TvSerie({
            title: "title" + i,
            imdbId: "imdbId" + i,
            posterLink: "link" + i
        }));
    }
    return result;
}
