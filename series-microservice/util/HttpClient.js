"use strict"

let unirest = require('unirest');

/*
 Façade that isolates the model from the http framework.
*/
function HttpClient() {

}

// Performs a get request
HttpClient.get = function(url, params, callback) {
	unirest.get(url + params)
		.headers({
			'Accept': "application/json",
			'Content-Type': "application/json"
		})
		.end(callback);

}

module.exports = HttpClient;
