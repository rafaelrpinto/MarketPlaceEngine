"use strict"

let config = require('./config');
let express = require('express');
//let logger = require('morgan');
let bodyParser = require('body-parser');

//DB config
let mongoose   = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(config.db.uri);

//winston logger
let winston = require('winston');
winston.level = (process.env.LOG_LEVEL || config.log.level );
winston.add(winston.transports.File, { filename: config.log.filename });

//Express setup
let app = express();
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Route definitions
let series = require('./routes/seriesController');
app.use('/series', series);
let episodes = require('./routes/episodesController');
app.use('/episodes', episodes);

module.exports = app;
