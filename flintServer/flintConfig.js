//Flint server configuration
require('dotenv').config();
var SparkWebSocket = require('ciscospark-websocket-events');
var accessToken = process.env.SPARK_BOT;
var webHookUrl =  "http://localhost:8080/flint";
var Flint = require('node-flint');
var log = require('../svrConfig/logger');
var roomDb = require('../model/crud');
var conversation = require('../flintConversations/conversation');
var fileWatcher = require('../myutils/fileWatcher');

// Spark Websocket Intialization
var sparkwebsocket = new SparkWebSocket(accessToken);
sparkwebsocket.connect(function(err,res){
  if (!err){
    log.info('flintServer.websockets : '+res);
    sparkwebsocket.setWebHookURL(webHookUrl);
      
  }else{
    log.error("flintServer.websockets Startup: "+err);
  }
});

//loadfiles
fileWatcher.startUp;

// flint options
var config = {
  token: accessToken,
  port: process.env.WEBPORT,
  removeWebhooksOnStart: true,
  requeueMinTime: 500,
  requeueMaxRetry: 6,
  maxConcurrent: 5,
  minTime: 50
};

// init flint
var flint = new Flint(config);
flint.start();

//control authorization to the bot
function myAuthorizer(bot, trigger) {
  if(trigger.personDomain === process.env.ALLOW_DOMAIN) {
    return true;
  }
  else {
    bot.say("You are not authorized for use of this bot.");
    log.info("flintServer.flint Access Info - unauthorized access : "+trigger.personEmail);
    return false;
  }
}

flint.setAuthorizer(myAuthorizer);

// add flint event listeners
flint.on('message', function(bot, trigger) {
  log.info('flintServer : "%s" said "%s" in room "%s"', trigger.personEmail, trigger.text, trigger.roomTitle);
  log.info("flintServer : This is the room ID:"+ trigger.roomId);
});

flint.on('initialized', function() {
  log.info('flintServer : initialized %s rooms', flint.bots.length);
  
  
});
flint.on('spawn', function(bot) {
  log.info('flintServer : new bot spawned in room: %s', bot.room.id);
  var roomId = bot.room.id;
  roomDb.findRoom(roomId, function(err,rmDetails){
    log.info("flintConfig.spawn: "+rmDetails);
    if(err){
      //creates new room and writes new room to JOSN
      roomDb.createRoom(roomId, function(data){
        log.info('flintServer : Room created: '+ JSON.stringify(data));
        bot.say({markdown:"**Welcome to Stormy the Weather Bot.**<br> "+
        "Please set your forecast city for daily weather updates using the **/city** *your city* command.<br>"+
          "If you would prefer to have your temperature in Celsius instead of Fahrenheit make sure to use the **/unit metric** command to change."
        });
        return;
      });
    }  
    if(rmDetails.roomActive === "false"){
      log.info("flintServer : Room already exsisting. No room created.");
      rmDetails.conversationState.conversation = "commands";
      rmDetails.writeToFile();
      log.info("flintServer : Room has been reactivated");
      
      return;
    }
    if(rmDetails.roomActive === 'true') {
      rmDetails.conversationState.conversation = "commands";
      return log.info("flintServer : Room already active, no room created");
      
    }
    
    
  });  
    
  bot.repeat;
});

flint.on('despawn', function(bot){
  log.info('flintServer : Bot removed room: '+bot.room.id);
  var roomId = bot.room.id;
  roomDb.findRoom(roomId, function(err,rmDetails){
    if(err) return log.error("flintConfig.despawn :"+err);
    rmDetails.updateActive("false");
    rmDetails.writeToFile();
    rmDetails.cancelSchedule();
    rmDetails.on('cancel', function(){
                   rmDetails.reloadSchedule(); 
                });
  });
});

conversation(flint);



module.exports = flint;