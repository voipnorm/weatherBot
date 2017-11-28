var util = require('util');
var EventEmitter = require('events').EventEmitter;
var weather = require('../myutils/weather');
var CUpdateRD = require('./crud');
var schedule = require('node-schedule');
var Bottleneck = require('bottleneck');
var myutils = require('../myutils/myutils');
var moment =require('moment-timezone');
var log = require('../svrConfig/logger');

var limiter = new Bottleneck(2, 1000, 120);

function Room(roomId,city,timeZone,roomActive,unit, conversationState){
    //room ID
    this.roomId = roomId;
    this.roomActive = roomActive;
    //zip code
    this.roomZipCode = '';
    //Weather Alerts
    this.roomWAlerts = false;
    //Weather Alert occurence
    this.occurence = '';
    //location details
    this.city = city;
    this.state = '';
    this.cityId = '';
    this.unit = unit;
    this.timeZone = timeZone;
    //language
    this.conversationState = conversationState;
    this.language = 'en';
    this.init();
    
}
util.inherits(Room, EventEmitter);

Room.prototype.init = function (){
  //is the room active
  if(this.city===''){
      return this;
  }
  if(this.timeZone===''){
      this.timeZone = 'UCT';
  }
  if(this.roomActive === 'true'){
      this.scheduleDaily();
      this.scheduleForecast();
      log.info("spaceObj.init : Schedule loading for space "+this.roomId)
  }else{
      log.info("spaceObj.init : Inactive Space no schedule loaded for " +this.roomId)
      return this;
  }
  
  
};

Room.prototype.scheduleDaily = function (){
    var city =this.city;
    var unit = this.unit;
    var roomId = this.roomId;
    var timeZone = this.timeZone;
    //var daily;
    var time = this.processTimeZone(process.env.FIXED_TOD_AM, timeZone);
    //var j = 
    schedule.scheduleJob("Daily"+roomId,'00 00 '+time+' * * 0-7', function(){
        limiter.submit(weather.intial,city, unit, function(){
            weather.getForecast(1,function(err,data){
                if(err) return log.error("spaceObj.scheduleDaily : Forecast error in daily schedule.");
                myutils.sparkPost(data, roomId);
                log.info("spaceObj.scheduleDaily : Scheduled morning forecast for :" +roomId);
            });
        });
    });
    
    
    return this
};

Room.prototype.scheduleForecast = function (){
    var city =this.city;
    var unit = this.unit;
    var roomId = this.roomId;
    var timeZone = this.timeZone;
    var time = this.processTimeZone(process.env.FIXED_TOD_PM, timeZone);
    //var i = 
    schedule.scheduleJob("Forecast"+roomId,'00 00 '+time+' * * 0-7', function(){
        limiter.submit(weather.intial,city,unit, function(){
            weather.getForecast(3,function(err,data){
                if(err) return log.error("spaceObj.scheduleForecast : Forecast error in Schedule.");
                myutils.sparkPost(data, roomId);
                log.info("spaceObj.scheduleForecast : Scheduled forecast for :" +roomId);
            })
        });
    });
    
    return this
};

Room.prototype.processTimeZone = function (time){
    //log.info("input varibles into process tz : "+time + " & "+timeZone)
    var timeTz = moment.tz(time,this.timeZone);
    //log.info(timeTz)
    var convert = timeTz.tz('UCT').format('H');
    //log.info(convert);
    return convert;
};

Room.prototype.cancelSchedule = function(){
    var self = this;
    schedule.cancelJob("Daily"+this.roomId);
    schedule.cancelJob("Forecast"+this.roomId);
    self.emit('cancel');
    return this;
};


Room.prototype.updateConversationState =  function(obj){
    var self = this;
    self.conversationState = {
        conversation: obj.conversation,
        state: obj.state,
        city: null,
        unit: null,
        schedule: null
        
    };
    return self;
};

Room.prototype.updateCity = function(setting){
    var self = this;
    self.city = setting;
    log.info("spaceObj.updateCity : "+self.city);
    return self;
};
//update timezone using the city
Room.prototype.updateTimeZone = function(setting){
  var self = this;
  weather.getTimeZone(setting, function(err,result){
      if(err){
          self.timeZone = "America/Los_Angeles";
      }
      self.timeZone = result;
      return self;
  });
};
Room.prototype.updateTimeZoneDirect = function(setting){
    var self = this;
    self.timeZone = setting;
    return self;
};

Room.prototype.updateUnit = function(setting){
    var self = this;
    self.unit = setting;
    return self;
};

Room.prototype.updateActive =  function(setting){
    var self = this;
    self.roomActive = setting;
    self.writeToFile();
    return self;
};

Room.prototype.updateSpaceAll =  function(space){
    var self = this;
    self.city = space.city;
    self.unit = space.unit;
    self.updateTimeZone(space.city);
    return self;
};

Room.prototype.writeToFile = function(){
    var self = this;
    CUpdateRD.updateJSON(function(data){
        log.info(data);
    });
    self.emit('writeComplete');
    return self;
};

Room.prototype.reloadSchedule = function(){
    var self = this;
    self.cancelSchedule();
    log.info("spaceObj.reloadSchedule : Reload has been intiated......");
    self.init();
    self.emit('reload');
};

module.exports = Room;