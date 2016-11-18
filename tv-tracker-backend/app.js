var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var unirest = require('unirest');
var mongoose   = require('mongoose');
mongoose.Promise = require('bluebird');

// Route files
var series = require('./routes/seriesController');

//Express setup
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Route definitions
app.use('/series', series);

//DB config
mongoose.connect('mongodb://localhost:27017/tv-tracker'); // connect to our database

//Models
var TvSerie = require("./model/TvSerie");

module.exports = app;