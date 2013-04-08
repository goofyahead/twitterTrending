// Retrieve
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSONPure;
var MongoClient = require('mongodb').MongoClient;
var crypto = require('crypto');

var db = new Db('sw_events', new Server("127.0.0.1", 27017,
   {auto_reconnect: false, poolSize: 4}), {w:0, native_parser: false});

// Establish connection to db
db.open(function(err, db) {
  if(err) { 
    return console.dir(err);
} else {
    //opens the database and the menus collection
    db.createCollection('sw_events', {safe:true}, function(err, collection) {
        if (err) {
            console.log("The 'sw_events' collection doesn't exist. Creating it with sample data...");
        } else {
            console.log("Collection 'sw_events' exists.");
        }
    });
}
});

exports.addEvent = function (EventsObject) {
    console.log('Adding Events: ' + JSON.stringify(EventsObject));
    db.collection('sw_events', function(err, collection) {
        collection.insert(EventsObject, {safe:true}, function(err, result) {
            if (err) {
                return({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                return(result[0]);
            }
        });
    });
}


exports.findByEventsByCity = function(eventName, success, error) {
    
    db.collection('sw_events', function(err, collection) {
        if (err){
            console.log('not found');
        } else {
            collection.find({city: eventName},{sort:{start_date: -1}}).toArray(function(err, items) {
                if(err) {
                    console.log('not found');
                    return -1;
                } else {
                    if (items) {
                        success(items);
                    } else {
                        error();
                    }                    
                }
            });
        }
    });
}

exports.incrementEventsCount = function(EventsName) {

    db.collection('sw_events', function(err, collection) {
        collection.update({'Events': EventsName}, {$inc: {'count' : 1}}, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating menu: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                return(result);
            }
        });
    });
}