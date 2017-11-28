var _ = require('lodash');
var fs = require('fs');
var roomDb = require('../model/crud');
var Room = require('../model/data');
var roomsFilePath = './model/rooms.json';
var tzFilePath = './model/timeZoneLookup.json';
var roomDataArray = roomDb.roomDataObj;
var timeZoneArray = roomDb.tzDataObj;
var log = require('../svrConfig/logger');


//loadrooms on first load and reload from Array

function loadRooms(callback){
    
    readRoomsFile(roomsFilePath,function(array){
        var jobCount = array.length;
        if(array.length === 0){
            return callback();
        }else{
            _.forEach(array, function(room){
                roomDataArray.push(new Room(room.roomId,room.city,room.timeZone,room.roomActive,room.unit,{conversation:'commands',state:null}));
                
                
                if(--jobCount === 0) return callback();
            });
            
        }
    });
}

function loadTimeZone(callback){
    readRoomsFile(tzFilePath,function(array){
        var jobCount = array.length;
        if(array.length === 0){
            return callback();
        }else{
            _.forEach(array, function(tzObj){
                //parse tz data here and add new objects to array
                
                timeZoneArray.push(tzObj);
                
               if(--jobCount === 0) return callback();
                
            });
            
        }
    });
}
//read rooms file back into memory
function readRoomsFile(file, callback){
    var content='';
    fs.readFile(file,'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        try{
            content = JSON.parse(data);
            
        }catch (e){
            return log.error('fileWatcher.readRoomsFile :'+e);
        }
        return callback(content);
    });
}
//start process
function startUp(){
    loadRooms(function(){
        log.info("fileWatcher.startUp Rooms loaded : "+roomDataArray.length);
        loadTimeZone( function(){
            log.info("fielWatcher.startup Loaded tz:"+timeZoneArray.length);
        });
        
    });
    
}

module.exports = {startUp:startUp()};



