var crudDb = require('../model/crud');
var helpFile = require('../myutils/help.js');
var printLog = require('../myutils/changelog.js');
var _ = require('lodash');
var myutils = require('../myutils/myutils');
var weather = require('../myutils/weather');
var log = require('../svrConfig/logger');



module.exports = {
    
//test slash command
    hello: function(request, bot, trigger){
        if(bot.isGroup){
            log.info("conversationFunctions.hello : New group hello message sent");
            return bot.say('Hello %s! To get started just type @crb help', trigger.personDisplayName);
        }else{
            log.info("conversationFunctions.hello : 1:1 hello welcome sent");
            return bot.say('Hello %s! To get started just type help', trigger.personDisplayName);
        }
    },
//Prints out help array
    help: function(bot){
        log.info('conversationFunctions.help : Print help')
        if(bot.isGroup){
            log.info("conversationFunctions.help : help file accesssed");
            helpFile.help("en",function(data){
                return bot.say({markdown:data});
            });
        }else{
            log.info("conversationFunctions.help : 1:1 help file accesssed");
            helpFile.help("en",function(data){
                return bot.say({markdown:data});
            });
        }
    },
//prints out space settings to user
    settings: function(bot,spData){
        log.info('conversationFunctions.settings : Print space settings');
        return bot.say({markdown:'**Here are the Stormy settings for this Space:** <br>'+ 
        '**City**: '+spData.city +'<br>'+
        '**Unit**: '+spData.unit+ '<br>'+
        '**Time Zone**: '+spData.timeZone+ '<br>'+
        '**Schedule Active**: '+spData.roomActive+ '<br>'
            
        });
        
    },
//prints list of commands available to user
    commands: function(bot){
        log.info('conversationFunctions.commands : Print commands');
        return  bot.say({markdown: helpFile.commands});
    },
    adminCommands: function(bot){
        log.info('conversationFunctions.adminCommands : Print commands');
        return  bot.say({markdown: helpFile.adminCommands});
    },
//internal feedback command for simple request to developers from users
    feedback: function(request, bot, trigger){
        log.info('conversationFunctions.feedback : -> '+request);
        request = request + " Username: "+trigger.personEmail;
        var email = process.env.APP_ADMIN;
        bot.dm(email,request);
        return bot.say("Thank you for your feedback. For technical issues"+
        " I will get to them as soon as possible");
    },
//allows broadcast to all Spaces.
    broadcast: function(botsArray, request, bot, trigger){
        log.info('conversationFunctions.broadcast : all spaces broadcast message -> '+request);
        request = request.replace("/broadcast ",'');
                    
        if(trigger.personEmail.match(process.env.APP_ADMIN)){
            _.forEach(botsArray, function(bot) { bot.say({markdown:request}); });
        }else{
            bot.say("Sorry but your are not authorised for this command."+
            " The authoritities have been notified.");
            return bot.dm(process.env.APP_ADMIN,'Unauthorised attempt by this person: '+trigger.personEmail);
        }
    },
//print out release infospation
    release: function(bot){
        log.info('conversationFunctions.release : roadmap request');
        printLog.printChangeLog(function(log){
            return bot.say(log);
        }); 
    
    },
//reset your defaults and go back through the welcome process
    reset: function(request, bot, trigger, spData){
        log.info('conversationFunctions.reset : reset space settings -> '+spData.roomId);
        bot.say("Your Space settings have been reset. To start the setup process just say 'hi' to begin.");
        return spData.updateConversationState({conversation:'setup', state: null});
    
    },
//current temp and forecast for today
    today: function(request, bot, trigger, spData){
        
        log.info("conversationFunctions.today : one day forecast  -> "+request);
        if(request === '/today'){
            weather.intial(spData.city,spData.unit,function(){
                weather.getForecast(1,function(err,data){
                    if(err) return bot.say(err);
                    log.info("conversationsFunctions.today results : "+data);
                    return bot.say({markdown: data + "To see a different city's weather"+
                    " add a location after the /today command e.g.** /today** *Austin*<br>"});
                    
                });
      
            });
        }else{
            request = request.replace("/today ",'');
            weather.intial(request,spData.unit,function(){
                weather.getForecast(1,function(err,data){
                    if(err) return bot.say(err);
                    return bot.say({markdown: data});
                });
      
            });
        }
    
    },
//3 day forecast command
    forecast: function(request, bot, trigger, spData){
        log.info('conversationFunctions.forecast : forecast request -> ' +request);
        if(request ==="/forecast"){
            weather.intial(spData.city,spData.unit,function(){
                weather.getForecast(3,function(err,data){
                    if(err) return bot.say(err);
                    return bot.say({markdown: data + "To see a different city's weather add a"+
                    " location after the /forecast command e.g. **/forecast** *Austin*<br>"});
                });
      
            });
        }else{
            request = request.replace("/forecast ",'');
            weather.intial(request,spData.unit,function(){
                weather.getForecast(3,function(err,data){
                    if(err) return bot.say(err);
                    return bot.say({markdown: data})
                });
      
            });
        }
    },
//update unit setting
    unit: function(request, bot, trigger, spData){
        var text = request.replace("/unit ",'').toLowerCase();
        log.info("conversationFunctions.unit : Unit update request -> " +text);
        if(text === "fahrenheit"|| text === "imperial") {
            spData.updateUnit("imperial");
            spData.writeToFile();
            spData.on('writeComplete', function(){
                spData.reloadSchedule();
            });
            
            return bot.say("Thank you, we have updated your settings.");
            
        }else if(text === "celsius"|| text === "metric"){ 
            log.info("conversationFunctions.unit : Metric update -> "+text);
            spData.updateUnit("metric");
            spData.writeToFile();
            spData.on('writeComplete', function(){
                spData.reloadSchedule();
            });
            return bot.say("Thank you, we have updated your settings.");
        }else{
        return bot.say("Oh no, something went wrong, lets try this again.");
        
        }
    },
    
//update city and reload schedule
    city: function(request, bot, trigger, spData){
        log.info('conversationFunctions.city : update city -> '+request);
        var text = request.replace("/city ", '');
        weather.intial(text,spData.unit,function(){
                weather.getForecast(1,function(err,data){
                    if(err) return bot.say({markdown:err});
                    //log.info(data);
                    spData.updateCity(text);
                    spData.writeToFile();
                    spData.on('writeComplete', function(){
                            spData.reloadSchedule();
                    });
                    
                    return bot.say({markdown: data+ "Your city has been update to "+text});
                    
                });
      
            });
        
    },
//update Timezone
    tz: function(request, bot, trigger, spData){
        log.info('conversationFunctions.tz : Update tz '+request);
        var text = request.replace("/tz ",'');
        crudDb.findtz(text, function(err,data){
            if(err){
                log.error("conversationFunctions.tz : "+err);
                return bot.say({markdown:"Sorry but the time zone you entered has some issues."+
                    " The required format is **America/Los_Angeles**. Abbreviations are not accepted. "+
                    "To help identify the time zone you need use the **/findtz** *location* command."
                });
            }else{
            spData.updateTimeZone(text);
            spData.writeToFile();
            spData.on('writeComplete', function(){
                spData.reloadSchedule();
            });
            return bot.say('Time Zone has been set to: ' + text);
            }
        });

    },
//find tz based on city
    findtz: function(request, bot){
        log.info('conversationFunctions.findtz : lookup tz -> '+request);
        var text = request.replace("/findtz ",'');
                
        weather.getTimeZone(text,function(err, tz){
            
            if(err){
                return bot.say('Something went really wrong');
            }else{
                return bot.say('Time Zone for '+text+' is ' + tz);
            }
    
        });
    },
//update city and tz in one command by using the city
    citytz: function(request, bot, trigger, spData){
        log.info('conversationFunctions.citytz : Update City and TZ ->'+request);
        var text = request.replace("/citytz ",'');
        
        
            weather.intial(text,spData.unit,function(){
                weather.getTZAndWeather(function(err,tz,message){
                    if(err){
                        return bot.say(err);
                    }else{
                        spData.updateCity(text);
                        spData.updateTimeZone(text);
                        bot.say('Forecast City has been set to: ' + text);
                        bot.say({markdown: message + "**Time Zone**: "+tz});
                        spData.writeToFile();
                        return spData.on('writeComplete', function(){
                            spData.reloadSchedule();
                            });
                    }
                });
          });
    },
    schedule: function(request, bot, trigger, spData){
        log.info('conversationFunctions.schedule : '+request);
        var text = request.replace("/schedule ",'');
        if(text==="true"||text==="false"||text==="/unsubscribe"){
            if(text === "/unsubscribe") text = "false";
            spData.updateActive(text);
            //spData.writeToFile();
            if(text === "false") {
                spData.cancelSchedule();
                bot.say({markdown:"Thanks, we have updated your settings. Feel free to leave this space.<br>"+
                "To subscribe again just create a new space with Stormy and update your schedule to true."});
            }
            if(text === "true") bot.say("Thanks, we have updated your settings. Look for weather updates soon.");
            return spData.reloadSchedule();
        
        }else{
            return bot.say("Please ensure you enter either true or false after the /schedule.");
        }
        
    },
    who: function(bot){
        log.info("conversationFunctions.who : requested space users email");
        //log.info(JSON.stringify(bot.memberships,null, 2));
        _.forEach(bot.memberships,function(person){
            log.info(person.email);
            bot.say(person.email);
            });
        return;
    },
    spaceCount: function(botArrayNo, bot, trigger){
        log.info('conversationFunctions.spaceCount : Space count request.');
        if(trigger.personEmail.match(process.env.APP_ADMIN)){
            crudDb.activeRoomCounter(function(count){
                bot.say({markdown:"Current space count : " + botArrayNo + 
                    "<br> Active rooms : "+count });
            });
            
        }else{
            bot.say("Sorry but your are not authorised for this command."+
            " The authoritities have been notified.");
            return bot.dm(process.env.APP_ADMIN,'Unauthorised attempt by this person: '+trigger.personEmail);
        }
    },
    spaceID: function(bot, trigger){
        log.info('conversationFunctions.spaceID : Space ID request.');
        bot.say({markdown:"Space ID is : "+trigger.roomId})
    },
    appRestart: function(bot, trigger){
        log.info('conversationFunctions.appRestart : empty request, still under development');
        if(trigger.personEmail.match(process.env.APP_ADMIN)){
            log.info("conversationFunctions.appRestart : This does nothing.")
        }else{
            bot.say("Sorry but your are not authorised for this command."+
            " The authoritities have been notified.");
            return bot.dm(process.env.APP_ADMIN,'Unauthorised attempt by this person: '+trigger.personEmail);
        }
    },
//pass data to API.ai
    nlp: function(request, bot, trigger, spData){
        log.info('conversationFunctions.nlp : Request to API.AI');
        myutils.apiAiConversation(request,bot,trigger,spData,function(data){
            return bot.say({markdown: data});
        });
    }
};