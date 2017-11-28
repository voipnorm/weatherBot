require('dotenv').config();
var weather = require('openweather-apis');
var emojiDb = require('../model/emoji2');
var emoji = require('node-emoji');
var _ = require('lodash');
var tz = require('tz-lookup');
var weatherId = process.env.OPEN_WEATHER_API;
var NodeGeocoder = require('node-geocoder');
var log = require('../svrConfig/logger');



var emojiDbObj = _.clone(emojiDb);

var geoOptions = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GOOGLE_GEO_CODER, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(geoOptions);

module.exports = {
    intial: function(city,unit,callback){
      log.info('weather.intial : '+city);
      if(!city){
          log.info("weather.intial : City undefined: "+city);
          return log.info("weather.intial : City Undefined");
          
      }else{
          weather.setLang('en');
            // English - en, Russian - ru, Italian - it, Spanish - es (or sp),
            // Ukrainian - uk (or ua), German - de, Portuguese - pt,Romanian - ro,
            // Polish - pl, Finnish - fi, Dutch - nl, French - fr, Bulgarian - bg,
            // Swedish - sv (or se), Chinese Tra - zh_tw, Chinese Sim - zh (or zh_cn),
            // Turkish - tr, Croatian - hr, Catalan - ca
            // set city by name
            weather.setCity(city);
            // or set the coordinates (latitude,longitude)
            //weather.setCoordinate(coordinates);
            // or set city by ID (recommended by OpenWeatherMap)
            //weather.setCityId(cityId);

            // 'metric'  'internal'  'imperial'
            weather.setUnits(unit);

            // check http://openweathermap.org/appid#get for get the APPID
            weather.setAPPID(weatherId);
            callback();
          
      }
        
    },
    getTZAndWeather: function(callback){
        weather.getWeatherForecastForDays(1, function(err, weather){
            if(err || weather.cod === '404'||weather.cod === '502'){
                if(!err){
                    err = new Error("Undefined City");
                    log.info('weather.getTZAndWeather : ' +err);
                    return callback("Your city is not listed. Please use the **/city** command to adjust your city settings for daily forecasts", null, null);
                }
                log.info('weather.getTZAndWeather City not found');
                return callback("Your city is not listed. Please use the **/city** command to adjust your city settings for daily forecasts", null,null);
            }else{
                try{
                    parseWeather(weather, function(desStg){
                        getTimeZone(weather.city.name, function(err,t){
                            if(err){
                                log.error('weather.getTZAndWeather : ' +err);
                                return callback(err,t, desStg);
                            }else{
                                return callback(null,t,desStg);
                            }
                        });
                    });
                }catch(e){
                    return log.error('weather.getTZAndWeather : ' +e);
                }
            }
        });
  },

    getForecast: function(daysNo,callback){
        weather.getWeatherForecastForDays(daysNo, function(err, weather){
            if(err || weather.cod === '404'||weather.cod === '502'){
                if(!err) err = new Error("Undefined City");
                log.error('weather.getForecast : ' +err);
                return callback("Your city is not listed. Please use the **/city** command to adjust your city settings for daily forecasts",null);
            }else{
                
                try{
                    log.info('weather.getForecast : '+weather.city.name);
                    parseWeather(weather, function(desStg){
                        if(daysNo === 1){
                            return callback(null,desStg);
                        }else{
                            return callback(null,'3 day forecast for **'+weather.city.name+': **<br><br>'+desStg);
                        }
                    });
                }catch(e){
                    log.info("weather.getForecast : error information "+ JSON.stringify(weather));
                    return log.error("weather.getForecast : catchTry error "+e);
                }
            }
        });
    },
    getTimeZone: getTimeZone,
};

function getTimeZone(city, callback){
    geocoder.geocode(city, function(err, data){
        if(err){
            log.error("weather.getTimeZone :"+err);
            return callback(err);

        }
        log.info("weather.getTimeZone :"+JSON.stringify(data));
        if(data.length === 0){
            
            log.erro("weather.getTimeZone : City not found");
            return callback(new Error("Error on results: City not found"),"America/Los_Angeles");
        }

        var lat = data[0].latitude;
        var lng = data[0].longitude;
        log.info("weather.getTimeZone lat: "+lat+ "lng: "+lng);
        var timeZone = tz(lat,lng);
        log.info('weather.getTimeZone :'+timeZone);

        return callback(null,timeZone);


    });

}
function parseWeather(weather, callback){
    try{
        var days = weather.list;
        var pendingJobCount = days.length;
        var forecast = [];
        var completeForecastWeather;
    
        _.forEach(days, function(day){

            var ToD = dateConversion(day.dt);
            var weatherDes = day.weather[0].description;
            var des = day.weather[0].description;
                
            des = des.replace(/ /g, '_');
            //log.info(des);
            var forecastDes =  _.map(emojiDbObj,des);
            var currentTemp = Math.round(day.temp.morn);
            
            var tempMin = Math.round(day.temp.min);
            
            var tempMax = Math.round(day.temp.max);
            
            //var tempMax = day.temp[0].temp_max;
            //log.info(day.temp);
            
            if(days.length === 1){
                var concatCityWeather = converToEmoji("Todays forecast for "+weather.city.name+" is "+forecastDes);
                completeForecastWeather = concatCityWeather+'<br>'+
                    '**Current Temp** : '+currentTemp+'<br>'+
                    '**Forecast** : '+weatherDes+'<br><br>';
                log.info("weather.parseWeather : "+completeForecastWeather);
                return callback(completeForecastWeather);
            }else{
                var desWithEmoji = converToEmoji('**Description** : '+weatherDes+' '+forecastDes);
                completeForecastWeather = 
                'Weather for '+ToD +' : <br>'+
                '**Temp Low** : '+tempMin+'<br>'+
                '**Temp High** : '+tempMax+'<br>'+
                desWithEmoji+'<br><br>';
                forecast.push(completeForecastWeather);
                if(--pendingJobCount === 0 ){
                    var desStg = forecast.toString()
                        .replace(/\[/g, '')
                        .replace(/\]/g, '')
                        .replace(/,/g, '')
                        .trim();
                return callback(desStg);
                }
                
            
            }

        
        });

        
    }catch(err){
        return log.error("weather.parseWeather : "+err);
    }
    
    
}


function converToEmoji(text){
  var emojiText = emoji.emojify(text);
  return emojiText;
}

function dateConversion(time){
    var currentDate = new Date(time*1000);
    currentDate = currentDate.toISOString();
    currentDate = currentDate.replace(/T/, ' ');
    currentDate = currentDate.replace(/\..+/, '');

    return currentDate;
}

