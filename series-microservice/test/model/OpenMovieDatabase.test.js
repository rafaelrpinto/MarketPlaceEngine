"use strict"
const Promise = require("bluebird");
const rewire = require('rewire');
const sinon = require("sinon");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();

// mocks the request
const fakeRequest = sinon.stub();

//victim
const OpenMovieDatabase = rewire('../../model/OpenMovieDatabase');
OpenMovieDatabase.__set__({'request': fakeRequest});

describe('OpenMovieDatabase.js', () => {

    beforeEach((done) => {
        //fake request
        fakeRequest.reset();
        fakeRequest.returns(Promise.resolve({
            statusCode: 200,
            body: {
                success: true
            }
        }));
        done();
    });

    describe('#searchSerie()', () => {
        it("should receive results.", (done) => {
            fakeRequest.returns(Promise.resolve({
                statusCode: 200,
                body: {
                    Search: [
                        {
                            "Title": "The Walking Dead",
                            "Year": "2010–",
                            "imdbID": "tt1520211",
                            "Type": "series",
                            "Poster": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTc5NTU3Njg0N15BMl5BanBnXkFtZTgwMzY4MjM0ODE@._V1_SX300.jpg"
                        }, {
                            "Title": "Fear the Walking Dead",
                            "Year": "2015–",
                            "imdbID": "tt3743822",
                            "Type": "series",
                            "Poster": "https://images-na.ssl-images-amazon.com/images/M/MV5BMjQwODQ5ODYxOV5BMl5BanBnXkFtZTgwNDU3OTA0OTE@._V1_SX300.jpg"
                        }
                    ],
                    totalResults: 2
                }
            }));

            OpenMovieDatabase.searchSerie("doesn't", 'matter', 1).then((response) => {
                sinon.assert.calledOnce(fakeRequest);
                expect(response).to.not.be.null;
                response.totalResults.should.be.equals(2);
                response.Search.should.not.be.null;
                response.Search.should.be.lengthOf(2);
                response.Search[0].imdbID.should.be.equals("tt1520211");
                response.Search[1].imdbID.should.be.equals("tt3743822");
            }).should.be.fulfilled.and.notify(done);
        });

        it("can handle an empty search result", (done) => {
            fakeRequest.returns(Promise.resolve({
                statusCode: 200,
                body: {
                    "Response": "False",
                    "Error": "Movie not found!"
                }
            }));

            OpenMovieDatabase.searchSerie("doesn't", 'matter', 1).then((response) => {
                sinon.assert.calledOnce(fakeRequest);
                expect(response).to.not.be.null;
                response.totalResults.should.be.equals(0);
            }).should.be.fulfilled.and.notify(done);
        });
    });

    describe('#findByImdbId()', () => {
        it("can find a serie by imdb id", (done) => {
            fakeRequest.returns(Promise.resolve({
                statusCode: 200,
                body: {
                    "Title": "The Walking Dead",
                    "Year": "2010–",
                    "Rated": "TV-MA",
                    "Released": "31 Oct 2010",
                    "Runtime": "44 min",
                    "Genre": "Drama, Horror, Thriller",
                    "Director": "N/A",
                    "Writer": "Frank Darabont",
                    "Actors": "Andrew Lincoln, Chandler Riggs, Norman Reedus, Melissa McBride",
                    "Plot": "Sheriff Deputy Rick Grimes leads a group of survivors in a world overrun by the walking dead. Fighting the dead, fearing the living.",
                    "Language": "English",
                    "Country": "USA",
                    "Awards": "Nominated for 1 Golden Globe. Another 48 wins & 142 nominations.",
                    "Poster": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTc5NTU3Njg0N15BMl5BanBnXkFtZTgwMzY4MjM0ODE@._V1_SX300.jpg",
                    "Metascore": "N/A",
                    "imdbRating": "8.6",
                    "imdbVotes": "658,027",
                    "imdbID": "tt1520211",
                    "Type": "series",
                    "totalSeasons": "8",
                    "Response": "True"
                }
            }));

            OpenMovieDatabase.findByImdbId("doesn't matter").then((response) => {
                sinon.assert.calledOnce(fakeRequest);
                expect(response).to.not.be.null;
                response.Title.should.be.equals("The Walking Dead");
                response.imdbID.should.be.equals("tt1520211");
            }).should.be.fulfilled.and.notify(done);
        });

        it("can handle an empty search result", (done) => {

            fakeRequest.returns(Promise.resolve({
                statusCode: 200,
                body: {
                    "Response": "False",
                    "Error": "Incorrect IMDb ID."
                }
            }));

            OpenMovieDatabase.findByImdbId("doesn't matter").then((response) => {
                sinon.assert.calledOnce(fakeRequest);
                expect(response).to.be.null;
            }).should.be.fulfilled.and.notify(done);
        });
    });

    //TODO more tests
});
