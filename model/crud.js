var Room = require('../model/data');
var _= require('lodash');
var fileUpdate = require('./fileUpdate');
var roomDataObj = [];
var tzDataObj =[];
var log = require('../svrConfig/logger');

exports.createRoom = function(roomId, callback){
        var newRoom = new Room(roomId,'San Jose','America/Los_Angeles','true','imperial',{conversation:'setup',state: null});
        roomDataObj.push(newRoom);
        fileUpdate.toJSONFile(roomDataObj,function(){
            callback(newRoom);
        });
};
exports.findRoom = function(roomIdString, callback){
        log.info('crud.findRoom Room find called by:'+roomIdString);
        var foundRoom = _.find(roomDataObj, {roomId: roomIdString});
        
        if(!foundRoom) return callback(new Error("room undefined"));
        
        log.info('crud.findRoom Found Room Id: '+foundRoom.roomId);
        return callback(null,foundRoom);
};
exports.findtz = function(tz, callback){
        log.info('crud.findTz : '+tz);
        var foundTZ = _.find(tzDataObj, {timezone: tz});
        if(!foundTZ) return callback(new Error("TimeZone undefined"));
        log.info("crud.findtz :"+foundTZ);
        return callback(null,foundTZ);
};
exports.updateJSON = function(callback){
        fileUpdate.toJSONFile(roomDataObj,function(){
            callback("Update complete");
        });
};
exports.activeRoomCounter = function(callback){
        var activeRoom = 0;
        _.forEach(roomDataObj, function(room){
                if(room.roomActive === "true") ++activeRoom;
        });
        return callback(activeRoom);
};

exports.roomDataObj = roomDataObj;
exports.tzDataObj = tzDataObj;

