/* 
Module parses all incoming requests from Spark webhooks and provides the responses for the bot from the node-flint framework.
*/
var crudDb = require('../model/crud');
var botString = process.env.SPARK_BOT_STRING;
var convoFunc = require('./conversationFunctions');
var spaceSetup = require('./conversationSetupSpace');
var log = require('../svrConfig/logger');

module.exports = function(flint){
    flint.hears(/(^| ).*( |.|$)/i, function(bot, trigger) {
 
        log.info("conversation.hears : triggered : "+trigger.text );
        var lowerBotString = botString.toLowerCase();
        var text = trigger.text.replace(botString,'')
            .replace('@'+lowerBotString,'')
            .replace(lowerBotString,'')
            .replace('@'+botString,'');
        var spaceId = trigger.roomId;
        
                          
        
        crudDb.findRoom(spaceId, function(err,spData){
            if(err) return log.error(err);
            var request = text;
            
            log.info('conversation.hears : '+request);
            log.info("conversation.hears : " +JSON.stringify(spData));
            if(!spData) return(spaceId+ " is undefined");
            //conversation: setup
            if(spData.conversationState.conversation === 'setup'){
                log.info("conversation.hears : Welcome thread...." +spData.setup)
                switch(spData.conversationState.state){
                    case null:
                        log.info("conversation.hears : ......part 1" + spaceId);
                        return spaceSetup.setupConvo1(request, bot, trigger, spData);
                    case "1":
                        log.info("conversation.hears : ......part 2" + spaceId);
                        return spaceSetup.setupConvo2(request, bot, trigger,spData);
                    case '2':
                        log.info("conversation.hears : ......part 3" + spaceId);
                        return spaceSetup.setupConvo3(request, bot, trigger,spData);
                    case '3':
                        log.info("conversation.hears : ......final complete."+ spaceId);
                        return spaceSetup.setupConvo4(request, bot, trigger,spData);
                    default:
                        return;
                    }
            }else{
            
            switch(true){
                case (/(^| )\/hello( |.|$)/).test(request):
                    return convoFunc.hello(text, bot, trigger);
                case (/(^| )\/help( |.|$)/).test(request):
                    return convoFunc.help(bot);
                case (/(^)help( |.|$)/).test(request):
                    return convoFunc.help(bot);
                case (/(^| )\/release( |.|$)/).test(request):
                    return convoFunc.release(bot);
                case (/(^| )\/reset( |.|$)/).test(request):
                    return convoFunc.reset(text, bot, trigger, spData);
                case (/(^| )\/who( |.|$)/).test(request):
                    return convoFunc.who(bot);
                case (/(^| )\/settings( |.|$)/).test(request):
                    return convoFunc.settings(bot,spData);
                case (/(^| )\/broadcast( |.|$)/).test(request):
                    return convoFunc.broadcast(flint.bots, text, bot, trigger);
                case (/(^| )\/commands( |.|$)/).test(request):
                    return convoFunc.commands(bot);
                case (/(^| )\/adminCommands( |.|$)/).test(request):
                    return convoFunc.adminCommands(bot);
                case (/(^| )\/feedback( |.|$)/).test(request):
                    return convoFunc.feedback(text, bot, trigger, spData);
                case (/(^| )\/today( |.|$)/).test(request):
                    return convoFunc.today(text, bot, trigger, spData);
                case (/(^| )\/forecast( |.|$)/).test(request):
                    return convoFunc.forecast(text, bot, trigger, spData);
                case (/(^| )\/unit( |.|$)/).test(request):
                    return convoFunc.unit(text, bot, trigger, spData);
                case (/(^| )\/city ( |.|$)/).test(request):
                    return convoFunc.city(text, bot, trigger, spData);
                case (/(^| )\/citytz( |.|$)/).test(request):
                    return convoFunc.citytz(text, bot, trigger, spData);
                case (/(^| )\/tz( |.|$)/).test(request):
                    return convoFunc.tz(text, bot, trigger, spData);
                case (/(^| )\/findtz( |.|$)/).test(request):
                    return convoFunc.findtz(text, bot);
                case (/(^| )\/schedule( |.|$)/).test(request):
                    return convoFunc.schedule(text, bot, trigger, spData);
                case (/(^| )\/unsubscribe( |.|$)/).test(request):
                    return convoFunc.schedule(text, bot, trigger, spData);
                case (/(^| )\/spaceCount( |.|$)/).test(request):
                    return convoFunc.spaceCount(flint.bots.length, bot, trigger);
                case (/(^| )\/spaceID( |.|$)/).test(request):
                    return convoFunc.spaceID(bot,trigger);
                case (/(^| )\/killMeNow( |.|$)/).test(request):
                    return convoFunc.appRestart(bot, trigger);
                default:
                    convoFunc.nlp(text, bot, trigger,spData);
            }}
                
        });
            
    });
    return flint;
};
