//help chat text used in help command
var welcome = "**Hi! I'm Stormy the Weather Bot.<br>**";
var firstTime = "**Hi I am Stormy the Weather Bot**. "+
    " Thanks for inviting me to the space. Please use the **/help or just help** to get started and see supported features.";
var setup = "";
var step1 = "<br>**Step 1**: Add Stormy to a space or a 1:1 conversation or if you want to have daily forecasts for multiple cities add Stormy to a team with each space used for a different city.";
var step2 = "<br>**Step 2**: Stormy will run you through the welcome process in a new Space. If you want to run through the process again you can use the **/reset** command. ";
var step3 = "You can update your time zone manually if you prefer to get daily forecasts at a time different than the city you have set. Just use the **/tz** *your timezone* command.<br><br>"+
            "If you are traveling and need to change your city and time zone at the sametime use the **/citytz** *your city* command. This will update both.<br><br>"+
            "By default the scheduled weather update will run daily but you can turn this off by using the **/schedule** *true or false* command. Using the false keyword turns off the daily schedule.<br><br>"+
            "Congrats, you are all done. Now every morning Stormy will send you daily weather details in the morning before heading out to work and a three day forecast in the afternoon before heading home.";

var additionalCommands = "<br>To get fast access to weather try the **/today** *location* or the **/forecast** *location* commands.<br><br>"+
            "You can also ask Stormy a direct weather question like *What is the weather in Seattle today?* and Stormy will look it up for you.<br>";
var rmSettings = "<br>To see what your current space settings are type **/settings**.<br>";
var inRoomFeedback = "<br> To provide feedback in the space your using use **/feedback ***your feedback* command."


//group help
var welcomeGroup = "**Hi! I'm Stormy the Weather Bot powered by openweather.org**";
//var firstTimeGroup = "**Hi! I'm Stormy the Weather Bot powered by openweather.org**. "+
//    " Thanks for inviting me to the space. Please use the **@stormy help** command to get started and see supported features. ";
var setupGroup = "<br>I provide daily weather updates. Just let me know what city your in. If you would like to get forecast from multiple cities just add me to a team and use different rooms for each city. ";

var inRoomFeedbackGroup = " <br>To provide feedback in the space your using use **@chatbot feedback ***your feedback* command."

var commands =  ">**/city** *location*     - Set your location for scheduled weather updates, first use time zone is updated automatically.<br>"+
                "**/citytz** *location*   - Set your location and automatically update your time zone for scheduled weather updates.<br>"+
                "**/command**             - A list of currently available commands.<br>"+
                "**/feedback** *text*     - Send feedback or issues to Stormy creators.<br>"+
                "**/findtz** *text*       - Lookup a time zone for a location.<br>"+
                "**/forecast** *location* - Instant three day forecast.<br>"+
                "**/help**                - Space setup instructions.<br>"+
                "**/release**             - See recent updates and features added to Stormy and whats coming.<br>"+
                "**/reset**               - Reset your settings and go through the intial Space setup again.<br>"+
                "**/schedule** *true or false* - Turn daily weather forecast on or off per space/chat basis.<br>"+
                "**/settings**            - Shows your current space settings.<br>"+
                "**/today**               - Ondemand one day forecast.<br>"+
                "**/tz**                  - Manually set your time zone using standard nomenclature e.g CET or Europe/Oslo.<br>"+
                "**/unit** *unit*         - Set your preffered unit of measurement.<br>"+
                "**/unsubscribe**       - Remove daily updates and unsubscribe from Stormy.<br>"+
                "**/who**                 - See all the email addresses for everyone in the space.";
var adminCommands =  "**/adminCommand**             - A list of currently available commands.<br>"+
                "/spaceID <br> /spaceCount <br> /adminCommand <br>/broadcast <br> /who"

var helpTextSetup = [welcome+setup+step1+step2+step3,additionalCommands+rmSettings+inRoomFeedback];

var helpGroup = [welcomeGroup,setupGroup, inRoomFeedbackGroup];
var getStarted = [firstTime,inRoomFeedback];
//builing the array

exports.helpTextSetup = helpTextSetup;
exports.helpGroup = helpGroup;

exports.help = function(language, callback){

    for (var i = 0; i< helpTextSetup.length; i++){

            (function(n) {
                setTimeout(function(){
                    
                    callback(helpTextSetup[n]);
                },i* 1000);
            }(i));
        }
   
};

exports.helpGroup = function(language, callback){

    for (var i = 0; i< helpGroup.length; i++){

            (function(n) {
                setTimeout(function(){
                    
                    callback(helpGroup[n]);
                },i* 1000);
            }(i));
        }
   
};

exports.getStarted = function(language, callback){
    for (var i = 0; i< getStarted.length; i++){

            (function(n) {
                setTimeout(function(){
                    
                    callback(getStarted[n]);
                },i* 1500);
            }(i));
        }
};

exports.commands = commands;
exports.adminCommands = adminCommands;