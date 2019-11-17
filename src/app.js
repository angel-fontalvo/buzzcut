var express = require('express');
var path = require('path');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var catalogRouter = require('./routes/catalog'); //Import routes for "catalog" area of site
var compression = require('compression');
var helmet = require('helmet');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression()); //Compress all routes
app.use(helmet());
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', indexRouter);
app.use('/catalog', catalogRouter); 

module.exports = app;