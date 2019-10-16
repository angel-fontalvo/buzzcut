var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));

// default options
// app.use(fileUpload());

// app.post('/upload', function (req, res) {
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).send('No files were uploaded.');
//     }
  
//     console.log(req.files.imgObj); // the uploaded file object
  
//     // The name of the input field (i.e. "imgObj") is used to retrieve the uploaded file
//     let imgObj = req.files.imgObj;
  
//     // Use the mv() method to place the file somewhere on your server
//     imgObj.mv('/dist/img/tmpimg.jpg', function (err) {
//       if (err)
//         return res.status(500).send(err);
  
//       res.send('File uploaded!');
//     });
//   });

app.use('/', indexRouter);

module.exports = app;