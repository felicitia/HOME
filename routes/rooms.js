/**
 * Created by felicitia on 11/9/15.
 */

var express = require('express');
var router = express.Router();
var string2json = require("string-to-json");

/*
 POST to /rooms/light
 input: {"user":"user2", "time" : "YYYY:MM:DD:HH:MM:SS" , “room”: “bedroom1”, “key”: “light1”, “value”, “on"}
 */
router.post('/light', function (req, res) {
    var db = req.db;
    var roomsCollection = db.get('rooms');
    var recentCollection = db.get('recent');
    var reqBody = req.body;
    var userId = reqBody.user;
    var roomId = reqBody.room;
    var key = reqBody.key;
    var value = reqBody.value;
    var time = reqBody.time;
    var updatedField = string2json.convert({"value": value, "time": time});

    recentCollection.find({user: userId}, {}, function (err, doc) {
        if (err) {
            console.log('err in rooms/light POST find: ' + err);
        }
        //if no recent collection
        if (doc.length == 0) {
            var recentPost = string2json.convert({"user": userId, "room": roomId, [key] : updatedField});
            recentCollection.insert(recentPost, function (err, result) {
                if (err) {
                    console.log('err in /rooms/light POST insert: ' + err);
                }
            });
        } else {
            var tmp = string2json.convert({[key] : updatedField});
            recentCollection.update({
                user: userId,
                room: roomId
            }, {$set: tmp},
            function (err) {
                if (err) {
                    console.log('err in /rooms/light POST update: ' + err);
                }
            }

        )
            ;
        }
    });

    var history = string2json.convert({"user" : userId, "room" : roomId, "key" : key, "value" : value, "time" : time});
    roomsCollection.insert(history, function (err, result) {
        if (err) {
            console.log('err in /rooms/light POST insert: ' + err);
        }
    });

    res.send('ok');
});

module.exports = router;
