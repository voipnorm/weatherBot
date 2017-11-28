var changeLog = 
"1-31-2017 Stormy is created\n"+
"1-31-2017 Stormy is live but mostly not configured\n"+
"2-13-2017 openweather.org current Weather API provider\n"+
"2-13-2017 API.ai bots NLP engine added\n"+
"2-13-2017 Forecast ability added for 6am daily UCT\n"+
"2-13-2017 Emoji support added\n"+
"2-13-2017 MultiFarecast ability and single day added to slash commands\n"+
"2-13-2017 Welcome message on new Spawn added\n"+
"2-13-2017 More stuff to come\n"+
"2-20-2017 TimeZone feature added to scheduling\n"+
"2-20-2017 Ability to set temp format\n"+
"2-20-2017 Updated min and max temp to day and night JSON options\n"+
"2-20-2017 Fix crash bug on unknown city forecast\n"+
"2-27-2017 Scheduled three day forecast for 5PM added\n"+
"2-27-2017 Help file updated to include commands text and /commands added\n"+
"2-27-2017 /citytz command added to set new location and automatic time zone update\n"+
"2-27-2017 Manually set your time zone with /tz command\n"+
"2-27-2017 Clear wording on /settings\n"+
"2-27-2017 Clearer meaning on /unit updates\n"+
"2-28-2017 Added version 2 timeZone upgrade to rooms file on startup \n"+
"2-29-2017 Added reload file code to overcome required() caching, note to self use fs.readFile on file changes\n"+
"2-29-2017 Fixed 502 error despawn issue, added new attribute for active room \n"+
"2-29-2017 Users can now leave a room or a 1:1 and settings are only deactivated not deleted \n"+
"2-29-2017 Rooms without a city no longer loaded into schedule, caused timezone crash when loaded\n"+
"4-24-2017 Welcome process added.\n"+
"4-24-2017 temps rounded.\n"+
"4-24-2017 New bot in API.AI configured\n"+
"4-24-2017 Weather module rewritten\n"+
"4-24-2017 Space module added new prototypes to handle room added to rroms array\n"+
"4-27-2017 Reloads on new space no longer required\n"+
"5-25-2017 New setup option for scheduled updates during setup process.\n"
"end."

exports.printChangeLog = function(callback){
    callback(changeLog);
};