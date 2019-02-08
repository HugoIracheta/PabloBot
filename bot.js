var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var mysql = require('mysql');
var request = require('request');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pablodb"
});


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`

    if(user == "Pokécord"){
        if(message.indexOf("has challenged you to a duel") > -1){
            var sql = "SELECT source from source where INSTR('malfoy', command) > 0";
                con.query(sql, function (err, result, fields) {
                    if (err) throw err;
                    if(result == null || result.length < 1){
                    }else{
                        bot.sendMessage({
                            to: channelID,
                            message: result[0].source
                        });
                    }
                });
        }else if(message.indexOf("Duel accepted!") > -1){
            bot.sendMessage({
                to: channelID,
                message: "https://www.youtube.com/watch?v=ybTL7mI6K2M"
            });
             var sql = "SELECT source from source where INSTR('potter', command) > 0";
                con.query(sql, function (err, result, fields) {
                    if (err) throw err;
                    if(result == null || result.length < 1){
                    }else{
                        bot.sendMessage({
                            to: channelID,
                            message: result[0].source
                        });
                    }
                });
        }
    }
    //message = /^[ a-zA-Z0-9_.-]*$/.match(message);

    if (user != "Pablo Bot" && /^[ a-zA-Z0-9_.-:\/?=-]*$/.test(message)) {
        var args = message.split(' ');
        var cmd = args[0];
        args = args.splice(1);    
        switch(cmd) {
            // !ping
            case 'intro':
                bot.sendMessage({
                    to: channelID,
                    message: 'Hola tio '+user+'!'
                });
                break;

            case 'u2':
            case 'youtube':
                var searchString = "";
                for(var i = 0; i<args.length; i++){
                    searchString += args[i]+" ";
                }
                request('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q='+searchString+'&type&key=AIzaSyBeyTLfpXd7uHGGoAjmBA_p-AXEqESJzuU', function (error, response, body) {
                  var json = JSON.parse(body);
                  var items = json['items'];
                  for(var p = 0; p<items.length; p++){
                    if(items[p]['id']['kind'] == 'youtube#video'){
                      bot.sendMessage({
                        to: channelID,
                        message: "https://www.youtube.com/watch?v="+items[p]['id']['videoId']
                      });
                      break;
                    }
                  }
                });
                break;


            case 'help':
                request({
                  url: 'https://discordapp.com/api/channels/'+channelID,
                  method: 'GET',
                  headers: {
                    'Authorization' : "Bot "+auth.token
                  }
                }, function(err, res, body) {
                });
            break;

            case 'factor':
                var year = new Date();
                year = year.getFullYear();
                var christmas  = new Date(year, 06, 26);
                var today = new Date();
                var until = Date.daysBetween(today, christmas);
                bot.sendMessage({
                    to: channelID,
                    message: 'Faltan '+until+' dias para el factor !'
                });
                bot.sendMessage({
                    to: channelID,
                    message: '!aah'
                });

                break;

            case 'navidad':
                var year = new Date();
                year = year.getFullYear();
                var christmas  = new Date(year, 11, 25);
                var today = new Date();
                var until = Date.daysBetween(today, christmas);
                bot.sendMessage({
                    to: channelID,
                    message: 'Faltan '+until+' dias para navida tio!'
                });

                break;

            case 'smush':
                var smush  = new Date(2018, 11, 7);
                var today = new Date();
                if(today.getDate()){
                  bot.sendMessage({
                    to: channelID,
                    message: '!hoy'
                  });
                  break;
                }
                smush.setHours(0);
                var until = Date.timeBetween(today, smush);
                bot.sendMessage({
                    to: channelID,
                    message: 'Faltan '+until+' para Super Smash Bros. Ultimate tio!'
                });

                break;

            case 'melee':
            case 'marioparty':
            case 'comida':
            case 'expresopolar':
                var now  = new Date();
                var day = (now.getHours() >= 13) ? now.getDate() + 1 : now.getDate();
                var meleeHour = new Date(now.getFullYear(), now.getMonth(), day);
                meleeHour.setHours  (13)
                var until = Date.timeBetween(now, meleeHour);
                if(until  === null){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Ya es la hora de '+cmd+' tio'
                    });
                }else{
                    bot.sendMessage({
                        to: channelID,
                        message: 'Faltan '+until+' para el '+cmd+' tio!'
                    });
                }

                break;

            case 'random':
                var length = args.length;
                var index = Math.floor((Math.random() * length) + 0);
                bot.sendMessage({
                    to: channelID,
                    message: 'El resultados es '+args[index]+' tios!'
                });
                break;

            case 'source':
                switch(args[0]){
                    case 'create':
                    if(user == "Stemen"){
                        bot.sendMessage({
                            to: 167060297016803328,
                            message: 'Mike intento hacer el source: '+message
                        });
                        break;
                    }
                     var sql = "SELECT source from source where command = '"+args[1]+"'";
                        con.query(sql, function (err, result, fields) {
                            if (err) throw err;
                            if(result == null || result.length < 1){
                                var string = "";
                                for(var i = 2; i<args.length; i++){
                                    string += " "+args[i];
                                }
                                var sql = "INSERT INTO source (command, source) VALUES ('"+args[1]+"', '"+string+"')";
                                con.query(sql, function (err, result) {
                                    if (err) throw err;
                                    bot.sendMessage({
                                        to: channelID,
                                        message: "El source esta listo pa usarse tio"
                                    });
                                });
                            }else{
                                bot.sendMessage({
                                    to: channelID,
                                    message: "ese source ya existe weon >:-("
                                });
                            }
                        });
                    break;

                    case 'delete':
                        var sql = "DELETE FROM source WHERE command = '"+args[1]+"'";
                        con.query(sql, function (err, result) {
                            if (err) throw err; 
                            bot.sendMessage({
                                to: channelID,
                                message: "Se elimino el source :("
                            });
                        });
                    break;

                    case 'update':
                        var string = "";
                        for(var i = 2; i<args.length; i++){
                            string += " "+args[i];
                        }
                        var sql = "UPDATE source SET source = '"+string+"' WHERE command = '"+args[1]+"'";
                        con.query(sql, function (err, result) {
                            if (err) throw err; 
                            bot.sendMessage({
                                to: channelID,
                                message: "Se edito el source :poggers:"
                            });
                        });
                    break;
                    case 'list':
                        var sql = "SELECT command from source";
                        con.query(sql, function (err, result) {
                            if (err) throw err; 
                            var message = "";
                            for(var i = 0; i<result.length; i++){
                              message += " !"+result[i].command+",";
                            }
                            bot.sendMessage({
                                to: channelID,
                                message: message
                            });
                        });
                    break;

                    default:
                        var sql = "SELECT source from source where INSTR('"+message+"', command) > 0";
                        con.query(sql, function (err, result, fields) {
                            if (err) throw err;
                            if(result == null || result.length < 1){
                            }else{
                                bot.sendMessage({
                                    to: channelID,
                                    message: result[0].source
                                });
                            }
                        });
                    break;
                }

                break;

                default:
                    var sql = "SELECT source from source where INSTR('"+message+"', command) > 0";
                    con.query(sql, function (err, result, fields) {
                        if (err) throw err;
                        if(result == null || result.length < 1){
                        }else{
                            bot.sendMessage({
                                to: channelID,
                                message: result[0].source
                            });
                        }
                    });
                break;
            // Just add any case commands if you want to..
         }
     }
});

Date.daysBetween = function( date1, date2 ) {
  //Get 1 day in milliseconds
  var one_day=1000*60*60*24;

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;
    
  // Convert back to days and return
  return Math.round(difference_ms/one_day); 
}

Date.timeBetween = function( date1, date2 ) {
  //Get 1 day in milliseconds
  var one_hour=1000*60*60;
  var one_minute=1000*60;
  var one_second=1000;

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;
    
  // Convert back to days and return
  var horas = Math.floor(difference_ms/one_hour);
  var restante = difference_ms%one_hour;
  var minutos = Math.floor(restante/one_minute);
  restante = restante%one_minute;
  var segundos = Math.round(restante/one_second);

  return horas+" horas "+minutos+" minutos "+segundos+" segundos"; 
}