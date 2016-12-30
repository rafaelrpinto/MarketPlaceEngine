"use strict"

/*
	Test case for OpenMovieDatabase.js
*/
let sinon = require('sinon');
let assert = require("chai").assert;
let should = require("chai").should;

//Victim
let OpenMovieDatabase = require('../../model/OpenMovieDatabase');
//Dependencies to be mocked
let httpClient = require('../../util/HttpClient');

describe('OpenMovieDatabase.js', () => {
	describe('#searchSerie()', () => {

		let targetPromise = () => {
			return OpenMovieDatabase.searchSerie("doesn't", 'matter', 1);
		};

		setupCommonErrorTests(targetPromise);

		it("Should receive results.", (done) => {
			let mockResponse = {
				headers: {
					"content-type": "application/json"
				},
				body: {
					Search: [{
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
					}],
					totalResults: 2
				}
			};

			mockHttpResponse(mockResponse);
			targetPromise().then((response) => {
					assert(response.totalResults == 2, "Total results should have been 2");
					assert(response.Search != null, "The search results cannot be null");
					assert(response.Search.length == 2, "The search results must have 2 elements");
					assert(response.Search[0].Title == mockResponse.body.Search[0].Title, "[0] Responses not matching!");
					assert(response.Search[1].Title == mockResponse.body.Search[1].Title, "[1] Responses not matching!");
					done();
				})
				.catch(function(err) {
					assert.fail(1, 0, 'Should not have raised the exception: ' + err)
				});
		});

		it("can handle an empty search result", (done) => {
			let mockResponse = {
				headers: {
					"content-type": "application/json"
				},
				body: {
					"Response": "False",
					"Error": "Movie not found!"
				}
			};

			mockHttpResponse(mockResponse);
			targetPromise().then((response) => {
					assert(response.totalResults == 0, "Should have returned zero total!");
					done();
				})
				.catch(function(err) {
					assert.fail(1, 0, 'Should not have raised the exception: ' + err);
					done();
				});

		});

	});

	describe('#findByImdbId()', () => {

		let targetPromise = () => {
			return OpenMovieDatabase.findByImdbId("doesn't matter");
		};

		setupCommonErrorTests(targetPromise);

		it("can find a serie by imdb id", (done) => {
			let mockResponse = {
				headers: {
					"content-type": "application/json"
				},
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
			};

			mockHttpResponse(mockResponse);
			targetPromise().then((response) => {
					assert(response.Title == mockResponse.body.Title, "The title should be the same!");
					assert(response.Year == mockResponse.body.Year, "The title should be the year!");
					assert(response.imdbID == mockResponse.body.imdbID, "The title should be the id!");
					done();
				})
				.catch(function(err) {
					assert.fail(1, 0, 'Should not have raised the exception: ' + err);
					done();
				});

		});

		it("can handle an empty search result", (done) => {
			let mockResponse = {
				headers: {
					"content-type": "application/json"
				},
				body: {
					"Response": "False",
					"Error": "Incorrect IMDb ID."
				}
			};

			mockHttpResponse(mockResponse);
			targetPromise().then((response) => {
					assert(response == null, "The response should have been null!");
					done();
				})
				.catch(function(err) {
					assert.fail(1, 0, 'Should not have raised the exception: ' + err);
					done();
				});

		});
	});
});

// helper methods

// error test template
function errorTestTemplate(expectedError, mockResponse, targetPromise) {
	it('Should raise: ' + expectedError, (done) => {
		mockHttpResponse(mockResponse);
		//OpenMovieDatabase.searchSerie("doesn't", 'matter', 1)
		targetPromise().then(() => {
				assert.fail(1, 0, 'No error was thrown when it should have been');
			})
			.catch(function(err) {
				assert(err == expectedError, "Received wrong exception: " + err);
				done();
			});
	});
}

//mocks the http client to return a specific response
function mockHttpResponse(response) {

	//removes the previous mock to use a different response
	if (httpClient.get.restore) {
		httpClient.get.restore();
	}

	//forces httpClient.get to always return the specified response
	sinon.stub(httpClient, 'get', (url, params, callback) => {
		callback(response);
	});
}

// commons error tests for search methods
function setupCommonErrorTests(targetPromise) {
	errorTestTemplate("Error executing OMDB request : 'TestCode'", {
		error: {
			code: "TestCode"
		}
	}, targetPromise);
	errorTestTemplate("OMDB returned http error code: 400", {
		status: 400
	}, targetPromise);
	errorTestTemplate("OMDB returned http error code: 500", {
		status: 500
	}, targetPromise);
	errorTestTemplate("OMDB returned an invalid content type :'text/html'", {
		headers: {
			"content-type": "text/html"
		}
	}, targetPromise);
	errorTestTemplate("OMDB returned an error message : 'OMDB error'", {
		headers: {
			"content-type": "application/json"
		},
		body: {
			Error: "OMDB error"
		}
	}, targetPromise);
}
