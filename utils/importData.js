var _ = require('underscore');
var fs = require('fs');
var mongo = require('./../routes/mongo');

exports.importDataFromFile = function () {
	var input = fs.readFileSync(__dirname + '/../data/data.txt','utf8');
	var events = JSON.parse(input);
	_.each(events, function (elem){
		console.log(elem);
		mongo.addEvent(elem);
	});
}