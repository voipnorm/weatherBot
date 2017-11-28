'use strict'
var weather = require('./weather');
var moment = require("moment-timezone");
var apiai = require('apiai');
var request = require('request');
var aiApp = apiai(process.env.API_AI_KEY);
var sparkToken = process.env.SPARK_BOT;
var log = require('../svrConfig/logger');

var botStats = {
    'charTotalCount': 0,
    'botUptime':''
};

//calls to API.ai and process response
exports.apiAiConversation = function(text,bot,trigger,spData, callback){
    var request = aiApp.textRequest(text,{
    sessionId: trigger.personEmail
    });
    log.info(text);
    request.on('response', function(response){
        if(response.result.action === 'weather'){
            var d1 = new Date();
            var d2 = new Date(response.result.parameters['date-time']);
            if(!response.result.parameters.address.city) return callback("Make sure to mention a city with your request or use **/today** command.");
            
            if(d1.getDay() === d2.getDay()){
                
                    var location = response.result.parameters.address.city;
                    var unit = spData.unit;
                    weather.intial(location,unit, function(){
                        weather.getForecast(1,function(err,tz,message){
                            if(err) return log.error("myutils.apiai : "+err);
                            return callback(message);
                        })

                    })
                
            }else{
                
                    location = response.result.parameters.address.city;
                    unit = spData.unit;
                        weather.intial(location,unit, function(){
                            weather.getForecast(3,function(err,message){
                                if(err) return log.error("myutils.apiai.getforecast 3days : "+err)
                        //log.info(data);
                                return callback(message);
                                })

                        })
            
            }
        }else{
            callback(response.result.fulfillment.speech);
            //log.info(response.result.fulfillment.speech);
        }
    });
    request.on('error', function(error){
        log.info("API.AI Error : "+error);
    });
    request.end()
};

exports.processTZ = function(time, timeZone){
    var timeTz = moment.tz(time,timeZone);
    var convert = timeTz.tz('UCT').format('h');
    return convert;
};
//Spark message posts for scheduler
exports.sparkPost = function(text, to) {
    request({
        url: 'https://api.ciscospark.com/v1/messages',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sparkToken
        },
        body:
        JSON.stringify({'roomId': to,
        'markdown': text})
    }, function (error, response, body) {
        if (error) {
            log.info(error);
        } else {
            log.info(response.statusCode, body);
        }
    });
};


exports.botStats = botStats;
