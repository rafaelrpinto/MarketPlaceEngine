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
	describe('#searchWithRequestError()', function() {

		//mocks the http client to return an error with the request
		mockHttpResponse({
			error : {
				code : "TestCode"
			}
		});

		var expectedError = "Error executing OMDB request : 'TestCode'";

		it('Should raise: ' + expectedError, function() {
			return OMDB.search("doesn't", 'matter')
				.then(function() {
					assert.fail(1, 0, 'No error was thrown when it should have been')

				})
				.catch(function(err) {
					assert(err == expectedError, "Received wrong exception: " + err);
				});
		});
	});
});

//mocks the http client to return a specific response
function mockHttpResponse(response) {
	sinon.stub(httpClient, 'get', function(url, params, callback) {
		callback(response);
	});
}