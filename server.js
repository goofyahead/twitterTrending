var express = require('express');
var app = express();
var securesecureApp = express();
var https = require('https');
var http = require('http');
var fs = require('fs');
var tweets = require('./routes/tweets');
var importData = require('./utils/importData');
var HTTP_PORT= 8080;
var HTTPS_PORT = 4433;

app.configure(function(){
	app.use(express.bodyParser());
	app.use('/images', express.static(__dirname + '/public/images'));
	app.use('/videos', express.static(__dirname + '/public/videos'));
});

//WHILE NOT SSL CERT DEPLOYED
app.get('/api/token', tweets.getTweetsWithHash);
app.get('/api/getTimeline/:hashTag', tweets.getQuery);
app.get('/api/getTrending/:city', tweets.getTrendsOfCity);

app.get('/api/importData', importData.importDataFromFile);

app.listen(HTTP_PORT);
console.log('Listening http on port ' + HTTP_PORT +' and htpps on ' + HTTPS_PORT);