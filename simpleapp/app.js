
// Required libs

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// Required files
var indexRoute = require('./server/route/indexRoute');
var userRoute = require('./server/route/userRoute');

// Express setup
var app = express();
app.set('views', path.join(__dirname, 'server/view'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname, 'client/public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/public')));

//Routes
app.use('/', indexRoute);
app.use('/user', userRoute);

// 404 error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// internal error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Mongo connection setup
mongoose.connect('mongodb://localhost/simplemeanapp', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});


module.exports = app;
