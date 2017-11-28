var fs = require('fs');
var _= require('lodash');
var log = require('../svrConfig/logger');

function toJSONFile(rmArray, callback){
        var roomArray = [];
        var jobCount = rmArray.length;
        _.forEach(rmArray, function(room){
            var roomObj = {
                "roomActive" : room.roomActive,
                "timeZone" : room.timeZone,
                "city" : room.city,
                "unit" : room.unit,
                "roomId" : room.roomId
            };
            roomArray.push(roomObj);
            if(--jobCount === 0 ){
                fs.writeFile("./model/rooms.json", JSON.stringify(roomArray, null , 2), function(err) {
                    if(err) {
                        log.info('fileUpdate.toJSONFile : '+err);
                    }else{
                        log.info("fileUpdate.toJSONFile : Output saved to /rooms.json.");
                        return callback();
                    }
                
                });
            }
        
        });
    
}

module.exports = {toJSONFile: toJSONFile}