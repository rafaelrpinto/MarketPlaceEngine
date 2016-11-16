/*
	Test case for OMDB.js
*/
var sinon = require('sinon');
var assert = require("chai").assert;
var should = require("chai").should;

//Victim
var OMDB = require('../../model/OMDB');
//Dependencies to be mocked
var httpClient = require('../../util/HttpClient');

describe('OMBD', function() {
	describe('#search()', function() {
		errorTestTemplate("Error executing OMDB request : 'TestCode'", {
			error: {
				code: "TestCode"
			}
		});
	});
	describe('#search()', function() {
		errorTestTemplate("OMDB returned http error code: 400", {
			status: 400
		});
	});
	describe('#search()', function() {
		errorTestTemplate("OMDB returned http error code: 500", {
			status: 500
		});
	});
	describe('#search()', function() {
		errorTestTemplate("OMDB returned an invalid content type :'text/html'", {
			headers: {
				"content-type": "text/html"
			}
		});
	});
	describe('#search()', function() {
		errorTestTemplate("OMDB returned an error message : 'OMDB error'", {
			headers: {
				"content-type": "application/json"
			},
			body: {
				Error: "OMDB error"
			}
		});
	});
	describe('#search()', function() {
		it("Return totalResults = 0 instead of raising an error", function() {
			var callback = function(response) {
				assert(response.totalResults == 0, "Total results should have been 0");
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
	});
});

//success test template
function successTestTemplate(callback, mockResponse) {
	mockHttpResponse(mockResponse);
	return OMDB.search("doesn't", 'matter')
		.then(callback)
		.catch(function(err) {
			assert.fail(1, 0, 'Should not have raised the exception: ' + err)
		});
}

// error test template
function errorTestTemplate(expectedError, mockResponse) {
	it('Should raise: ' + expectedError, function() {
		mockHttpResponse(mockResponse);
		return OMDB.search("doesn't", 'matter')
			.then(function() {
				assert.fail(1, 0, 'No error was thrown when it should have been')

			})
			.catch(function(err) {
				assert(err == expectedError, "Received wrong exception: " + err);
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
	sinon.stub(httpClient, 'get', function(url, params, callback) {
		callback(response);
	});
}