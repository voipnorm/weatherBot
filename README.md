# Weather Bot Bot

Weather Bot is a weather bot designed for Cisco Spark. Where you expecting something else :).
To see a full working version please add stormy@sparkbot.io to a Spark space.

## Getting Started

Weather Bot is meant to be a base to which to build. Although it does not use a database for storing 
space data adding one should be as simple of replacing the crud file with your own database methods.

Weather Bot uses a json file to store a limited set of space data which is loaded on startup and rewriten on new space adds and removals.
Its simple but limited.

### Prerequisites

Nodejs, node-flint.

### Installing

#### Via Git
```bash
mkdir myproj
cd myproj
git clone https://github.com/voipnorm/weatherBot.git
npm install
```

Set the following environment variables...

```
GOOGLE_GEO_CODER=<developer key>
GOOGLE_PLACES_OUTPUT_FORMAT=json
SPARK_ROOM_ID=<admin spark room ID>
OPEN_WEATHER_API=<developer key>
API_AI_KEY=<developer key>
SPARK_BOT=<bot token>
FIXED_TOD_AM=2017-01-01 06:00
FIXED_TOD_PM=2017-01-01 17:00
WEBPORT=8080
NODE_ENV=development
SPARK_BOT_STRING=<bot string>
ALLOW_DOMAIN=<authorized domain>
APP_ADMIN=<admin email addres>
```
## Built With

* [node-flint](https://github.com/flint-bot/flint) - The bot framework used

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Nick Marus node-flint creator.

## Flint Support

Chat with us here:[flint-support](https://eurl.io/#rkwLEq4fZ)