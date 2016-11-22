/*
	Test case for OpenMovieDatabase.js
*/
var sinon = require('sinon');
var assert = require("chai").assert;
var should = require("chai").should;

//Victim
var OpenMovieDatabase = require('../../model/OpenMovieDatabase');
//Dependencies to be mocked
var httpClient = require('../../util/HttpClient');

describe('OpenMovieDatabase.js', () => {
	describe('#search()', () => {
		errorTestTemplate("Error executing OMDB request : 'TestCode'", {
			error: {
				code: "TestCode"
			}
		});
		errorTestTemplate("OMDB returned http error code: 400", {
			status: 400
		});
		errorTestTemplate("OMDB returned http error code: 500", {
			status: 500
		});
		errorTestTemplate("OMDB returned an invalid content type :'text/html'", {
			headers: {
				"content-type": "text/html"
			}
		});
		errorTestTemplate("OMDB returned an error message : 'OMDB error'", {
			headers: {
				"content-type": "application/json"
			},
			body: {
				Error: "OMDB error"
			}
		});
		it("Return totalResults = 0 instead of raising an error", (done) => {
			var callback = (response) => {
				assert(response.totalResults == 0, "Total results should have been 0");
				done();
			};
			var mockResponse = {
				headers: {
					"content-type": "application/json"
				},
				body: {
					Error: "Movie not found!"
				}
			};
			successTestTemplate(callback, mockResponse);
		});
		it("Search results found.", (done) => {
			var mockResponse = {
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

			var callback = (response) => {
				assert(response.totalResults == 2, "Total results should have been 2");
				assert(response.Search != null, "The search results cannot be null");
				assert(response.Search.length == 2, "The search results must have 2 elements");
				assert(response.Search[0].Title == mockResponse.body.Search[0].Title, "[0] Responses not matching!");
				assert(response.Search[1].Title == mockResponse.body.Search[1].Title, "[1] Responses not matching!");
				done();
			};
			successTestTemplate(callback, mockResponse);
		});

		//TODO: increase test coverage
	});
});


//success test template
function successTestTemplate(callback, mockResponse) {
	mockHttpResponse(mockResponse);
	OpenMovieDatabase.search("doesn't", 'matter', 1)
		.then(callback)
		.catch(function(err) {
			assert.fail(1, 0, 'Should not have raised the exception: ' + err)
		});
}

// error test template
function errorTestTemplate(expectedError, mockResponse) {
	it('Should raise: ' + expectedError, (done) => {
		mockHttpResponse(mockResponse);
		OpenMovieDatabase.search("doesn't", 'matter', 1)
			.then(() => {
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