var https = require('https');
var _ = require('underscore');
var mongo = require('./mongo')

exports.getTweetsWithHash = function (req, res) {
	var twitterTokenURL = 'api.twitter.com';
	var post_data = 'grant_type=client_credentials';

	var consumerKey = 'UcZg4gmb4DJw8MyY3Vug';
	var consumerSecret = 'P5ifhonWDkco3v6jcBNEwtQVNot9PUFtzwdwNAqFBi4';
	var authKey = 'Basic ' + new Buffer(consumerKey + ':' + consumerSecret).toString('base64');

	console.log(authKey);

	var options = {
		hostname: twitterTokenURL,
		path: '/oauth2/token',
		method: 'POST',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8',
			'Accept' : '*/*',
			'Authorization' : authKey
		}
	};

	var req = https.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));

		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
		console.log(e.stack);
	});

	req.write(post_data);
	req.end();
}

exports.getQuery = function (req, response) {

	var hashTag = req.params.hashTag;
	var options = {
		hostname: 'api.twitter.com',
		path: '/1.1/search/tweets.json?q=%23'+ hashTag +'&result_type=recent&count=2',
		method: 'GET',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8',
			'Accept' : '*/*',
			'Authorization' : 'Bearer AAAAAAAAAAAAAAAAAAAAACoVQQAAAAAAzCklG14a%2Bg31Dz7O0eWa4uvpABM%3DPHUzUxVRz2TtJ7zwf9S35vtK4733AP5rTNYNMDWAP4'
		}
	};

	var req = https.request(options, function(res) {
		var data = "";

		res.on('data', function (chunk) {
			data = data + chunk;
		});

		res.on('end', function() {
        	processJson(data);
			response.write(data);
			response.end();
   		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
		console.log(e.stack);
	});

	req.end();
}

exports.getTrendsOfCity = function (req, res) {
	var city = req.params.city;
	mongo.findByEventsByCity(city, function (items) {
		console.log(items[0]);
		getTweetsFromHashtag(items[0].twitter_hashtag, function (tweets) {
			processJson (tweets);
		}, function () { 
			console.log(error)
		});
	}, function () {
		console.log('error retrieving ' + city);
	});
}

function processJson (data) {
	var users = [];
	var images = [];
	var projects = [];
	var winners = [];
	var tweetList = [];

	console.log('processing json of tweets ');
	var tweets = JSON.parse(data);
	console.log('tweets to read: ' + tweets.statuses.length);
	console.log('max id requested was ' + tweets.search_metadata.max_id);
	if (tweets.search_metadata.next_results) {
		console.log('more resuts on ' + tweets.search_metadata.next_results);
	} else {
		console.log('no more to load');
	}
	_.each (tweets.statuses, function (item) {
		tweetList.push(item.text);
		users.push ({'name' : item.user.name, 'image' : item.user.profile_image_url});
		if (item.entities.media) {
			images.push(item.entities.media[0].media_url);
		}
		if (item.entities.hashtags) {
			_.each(item.entities.hashtags, function (elem){

				// check for project hash

				if (elem.text == 'SWproject') {
					var tweetText = item.text;
					var projectInfo = tweetText.substr(elem.indices[1] + 1, tweetText.length);
					projectInfo = projectInfo.split(' ')[0];
					console.log ('FOUND A PROJECTTT!!!!!');
					if (checkArrayByName(projectInfo.split('|')[0], projects) ) {
						console.log('project hit');
					} else {
						projects.push({'name' : projectInfo.split('|')[0], 'url' : projectInfo.split('|')[1]});
					}
				}

				// check for a winner hash
				if (elem.text == 'SWwin') {
					var tweetText = item.text;
					var projectInfo = tweetText.substr(elem.indices[1] + 1, tweetText.length);
					projectInfo = projectInfo.split(' ')[0];
					console.log ('FOUND A PROJECTTT!!!!!');
					if (checkArrayByName(projectInfo.split('|')[1], winners) ) {
						console.log('project hit');
					} else {
						winners.push({'name' : projectInfo.split('|')[1], 'position' : projectInfo.split('|')[0],'url' : projectInfo.split('|')[2]});
					}
				}

			});
		}
	});
	
	console.log(tweetList);
	console.log(users);
	console.log(images);
	console.log(projects);
	console.log(winners);
}

function checkArrayByName (value, array) {
	var found = false;
	for(var i = 0; i < array.length; i++) {
	    if (array[i].name == value) {
	        found = true;
	        break;
	    }
	}
	return found;	
}

function getTweetsFromHashtag (hashTag, success, error) {
	var hashTag = hashTag.split('#')[1];
	var data = "";
	var rootPath = '/1.1/search/tweets.json';
	var query = '?q=%23'+ hashTag +'-filter:retweets&result_type=recent&count=100';

	console.log('hashtag to search for ' + hashTag);

	queryForTweets(rootPath, query, data, success, error);
}

function queryForTweets (rootPath, query, data, success, error) {
	var options = {
		hostname: 'api.twitter.com',
		path: rootPath + query,
		method: 'GET',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8',
			'Accept' : '*/*',
			'Authorization' : 'Bearer AAAAAAAAAAAAAAAAAAAAACoVQQAAAAAAzCklG14a%2Bg31Dz7O0eWa4uvpABM%3DPHUzUxVRz2TtJ7zwf9S35vtK4733AP5rTNYNMDWAP4'
		}
	};

	var req = https.request(options, function(res) {

		res.on('data', function (chunk) {
			data = data + chunk;
		});

		res.on('end', function() {
			// console.log(data);
			success(data);
   		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
		console.log(e.stack);
	});
	req.end();
}