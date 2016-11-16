var unirest = require('unirest');

function OMDB() {

}

const OMDB_API_URL = "http://www.omdbapi.com/";
const CONTENT_TYPE = "application/json";

/*
	Searches for a title on OMDB.
	//TODO: unit tests,...
*/
OMDB.search = function(callback, searchTerm, searchType) {
	unirest.get(OMDB_API_URL + '?s=' + searchTerm + "&type=" + searchType)
		.headers({
			'Accept': CONTENT_TYPE,
			'Content-Type': CONTENT_TYPE
		})
		.end(function(response) {
			if (response.error) {
				//request error check
				callback(new Error("Error executing OMDB request :" + response.error.code));
			} else if (response.status > 399) {
				//response status check
				callback(new Error("OMDB returned status :" + response.status));
			} else {
				//response content type check
				var responseContentType = response.headers["content-type"];
				if (!responseContentType || responseContentType.indexOf(CONTENT_TYPE) == -1) {
					callback(new Error("OMDB returned an invalid content type :'" + responseContentType) + "'");
				} else if (response.body.Error){
					// OMDB 200 status with error
					callback(new Error("OMDB returned an error message : '" + response.body.Error + "'"));
				} else {
					//success
					callback(null, response.body);	
				}
			}
		});
}

module.exports = OMDB;