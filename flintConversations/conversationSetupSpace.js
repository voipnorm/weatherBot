"use strict";

var weather = require('../myutils/weather');
var log = require('../svrConfig/logger');
//setup conversation file
module.exports = {
    //Welcome conversation flow
    setupConvo1: function(request, bot, trigger, spData){
        bot.say("Please enter the name of the city you would like scheduled weather updates for.");
        spData.conversationState.conversation = "setup";
        spData.conversationState.state = "1";
        return;
    },
    setupConvo2: function(request, bot , trigger, spData){
        weather.intial(request,spData.unit,function(){
                weather.getForecast(1,function(err,data){
                    if(err) return bot.say("Your entered city was not available for forecasts, please try another city.");
                    log.info("conversationSetup.setupConvo2 : Returned text - > "+data);
                    bot.say("Would you prefer temperature to be displayed in Fahrenheit or Celsius?");
                    spData.conversationState.state="2";
                    spData.conversationState.city = request;
                    return;
                });
      
            });
    },
    setupConvo3: function(request, bot , trigger, spData){
        var text =request.toLowerCase();
        if(text === "fahrenheit") {
            spData.conversationState.state="3";
            spData.conversationState.unit = "imperial";
            
            return bot.say("Do you want daily scheduled weather updates in Spark? Just answer yes or no.");
            
        }
        if(text == "celsius"){ 
            spData.conversationState.state="3";
            spData.conversationState.unit = "metric";
            //spData.updateConversationState({conversation: "setup", state:"3", unit:"metric"});
            return bot.say("Do you want daily scheduled weather updates in Spark? Just answer yes or no.");
        }
        bot.say("Oh no, something went wrong. Lets try this again."+
        " Would you prefer temperature to be displayed in Fahrenheit or Celsius?");
        return; 
    },
    setupConvo4: function(request, bot , trigger, spData){
        var text =request.toLowerCase();
        log.info("conversationSetup.setupConvo4 :"+ JSON.stringify(spData.conversationState));
        spData.updateSpaceAll(spData.conversationState);
        if(text === "yes") {
            
            spData.updateActive("true");
            spData.updateConversationState({conversation: "commands", state:""});
            spData.writeToFile();
            return bot.say({markdown: "Thank you, your setup is now complete. To disable scheduled updates"+
            " just use the **/schedule false** command or **/unsubscribe**"});
            
        }
        if(text == "no"){ 
            spData.updateActive("false");
            spData.updateConversationState({conversation: "commands", state:""});
            spData.cancelSchedule();
            spData.on('cancel', function(){
                   spData.reloadSchedule(); 
                });
            spData.writeToFile();
            return bot.say({markdown: "Thank you, your setup is now complete. To enable scheduled updates"+
            " just use the **/schedule true** command."});
        }
        bot.say("Oh no, something went wrong. Lets try this again."+
        " Do you want daily scheduled weather updates in Spark? Just answer yes or no.");
        return; 
    }
};