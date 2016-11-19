var config = require('./config');
var express = require('express');
//var logger = require('morgan');
var bodyParser = require('body-parser');
var unirest = require('unirest');

//DB config
var mongoose   = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(config.db.uri);

//winston logger
var winston = require('winston');
winston.level = (process.env.LOG_LEVEL || config.log.level );
winston.add(winston.transports.File, { filename: config.log.filename });

//Express setup
var app = express();
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Route definitions
var series = require('./routes/seriesController');
app.use('/series', series);

//Models
var TvSerie = require("./model/TvSerie");

module.exports = app;