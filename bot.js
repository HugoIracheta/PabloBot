const Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var mysql = require('mysql');
var request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "weqwzgyhnewy",
  database: "pablodb"
});

const client = new Discord.Client();
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

client.once('ready', () => {
    console.log('Ready!');
});

client.login(auth.token);

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());


server.get("/", (req, res)  =>{
        res.status(200);
        res.send();
});


server.post('/bitbucket', (req, res) => {
    res.status(200);
    res.send();
    try{
        var channelID = 0;
        var event = req['headers']['x-event-key'];
        console.log(req['headers']['x-event-key']);

        //console.log(req['body']['actor']['links']['html']['href']);

        var sql = "SELECT channelID from bitbucket_repo where repo_name LIKE '%"+req['body']['repository']['name']+"%'";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            if(result == null || result.length < 1 || req['body']["pullrequest"] == null){
            }else{
                var description = "";
                var comment = "";
                switch(event){
                    case "pullrequest:created":
                        description = "Chequen este Pull Request tios :pray:";
                        break;

                    case "pullrequest:updated":
                        description = req['body']['actor']['display_name']+" actualizo un pr :open_mouth:";
                        break;

                    case "pullrequest:approved":
                        var cara3 = client.emojis.find(emoji => emoji.name === "cara3");
                        description = req['body']['actor']['display_name']+" aprobo este pr "+cara3.toString();
                        break;

                    case "pullrequest:fulfilled":
                        var poggers = client.emojis.find(emoji => emoji.name === "poggers");
                        description = req['body']['actor']['display_name']+" mergeo este pr "+poggers.toString();
                        break;

                    case "pullrequest:unapproved":
                        var cryingpepe = client.emojis.find(emoji => emoji.name === "cryingpepe");
                        description = req['body']['actor']['display_name']+" le quito la aprobacion a este pr "+cryingpepe.toString();
                        break;

                    case "pullrequest:comment_created":
                        var perritosandia = client.emojis.find(emoji => emoji.name === "perritosandia");
                        description = req['body']['actor']['display_name']+" creo un comentario "+perritosandia.toString();
                        comment = req['body']['comment']['content']['raw'];
                        break;

                    default:
                        description = "Se realizo una accion con el pr :)";

                }
                var title = 'Pull Request a '+req['body']['repository']['name'] + ": "+req['body']["pullrequest"]['title'];
                var titleUrl = req['body']["pullrequest"]["links"]["html"]['href'];
                var author = req['body']['actor']['display_name'];
                var authorImage = req['body']['actor']['links']['avatar']['href'];
                var authorUrl = req['body']['actor']['links']['html']['href'];
                var thumbnail = "https://pbs.twimg.com/profile_images/1026981625291190272/35O2KIRX_400x400.jpg";
                //sendDiscordMessage(channel, createEmbeded(title, titleUrl, author, authorImage, authorUrl, description, thumbnail));
                //var message = req['body']['actor']['display_name']+' hizo un push a '+req['body']['repository']['name']+". Checalo aqui: "+req['body']['repository']['links']['html']['href'];
                for(var i = 0; i<result.length; i++){
                    sendDiscordMessage(client.channels.get(result[i].channelID), createEmbeded(title, titleUrl, author, authorImage, authorUrl, description, thumbnail, comment));
                }
            }
        });
    }catch(ex){
        sendErrorMessage(ex);
    }
});

var listener = server.listen((process.env.PORT || 1337), () => {
    console.log("Server is up and running...");
    console.log(listener.address());
});
    
    client.on('message', msg => {
        var user = msg.member.user;
        var userID = msg.member.user.id;
		//if(userID == "167060297016803328" || userID == "230132050852577280") { return;}
        var channelID  = msg.channel.id;
        var message = msg.content;
        var channel = msg.channel;
        if(user == "Pokécord"){
	        if(message.indexOf("has challenged you to a duel") > -1){
	            var sql = "SELECT source from source where INSTR('malfoy', command) > 0";
	                con.query(sql, function (err, result, fields) {
	                    if (err) throw err;
	                    if(result == null || result.length < 1){
	                    }else{
	                        sendDiscordMessage(channel, result[0].source);
	                    }
	                });
	        }else if(message.indexOf("Duel accepted!") > -1){
            	sendDiscordMessage(channel, "https://www.youtube.com/watch?v=ybTL7mI6K2M");
	        	var sql = "SELECT source from source where INSTR('potter', command) > 0";
                con.query(sql, function (err, result, fields) {
                    if (err) throw err;
                    if(result == null || result.length < 1){
                    }else{
                        sendDiscordMessage(channel, result[0].source);
                    }
                });
	        }
    	}
    //message = /^[ a-zA-Z0-9_.-]*$/.match(message);

    if (user != "Pablo Bot" && /^[ a-zA-Z0-9_.-:\/?=-]*$/.test(message)) {
        var args = message.split(' ');
        var cmd = args[0];
        var noncutargs = message.split(' ');
        args = args.splice(1);
        switch(cmd) {
            case 'bitbucket':
                var nombreRepo = "";
                for(var i = 1; i<args.length; i++){
                    nombreRepo += args[i]+" ";
                }
                if(args[0] == "set"){
                    var sql = "INSERT INTO bitbucket_repo (channelID, repo_name) VALUES ('"+channelID+"', '"+nombreRepo+"')";
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        sendDiscordMessage(channel, "Se configuro el repositorio compa");
                    }); 
                } else if(args[0] == "unset"){
                    var sql = "DELETE FROM bitbucket_repo WHERE channelID = '"+channelID+"' AND repo_name = '"+nombreRepo+"'";
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        sendDiscordMessage(channel, "Se desconfiguro el repositorio compa :(");
                    }); 

                }
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
                  if(items[0] != null){
                      for(var p = 0; p<items.length; p++){
                        if(items[p]['id']['kind'] == 'youtube#video'){
                          sendDiscordMessage(channel, "https://www.youtube.com/watch?v="+items[p]['id']['videoId']);
                          break;
                        }
                      }
                    }else{
                        sendDiscordMessage(channel, "No se encontraron resultados <@"+userID+"> :c");
                    }
                });
                break;

            case 'embeded':
                    sendDiscordMessage(channel, createEmbeded("title", "https://discordjs.guide/creating-your-bot/#listening-for-messages", "author", "https://vignette.wikia.nocookie.net/meme/images/4/42/1385136139955.png/revision/latest?cb=20150207013804", "https://discordjs.guide/creating-your-bot/#listening-for-messages", "description", "https://vignette.wikia.nocookie.net/meme/images/4/42/1385136139955.png/revision/latest?cb=20150207013804"));
                    break;


            case 'tenor':
                var searchString = "";
                for(var i = 0; i<args.length; i++){
                    searchString += args[i]+" ";
                }
                request('https://api.tenor.com/v1/search?key=DOP4FGV8TWFO&q='+searchString+'&locale=en_US&contentfilter=off&limit=1', function (error, response, body) {
                    if(body === undefined){
                        sendDiscordMessage(channel, "Ups no hay internet :c");
                        sendDiscordMessage(channel, results[0]['itemurl']);
                        return;
                    }
                  var json = JSON.parse(body);
                  var results = json['results'];
                  if(results[0] != null){   
                        sendDiscordMessage(channel, results[0]['itemurl']);
                  }else{
                        sendDiscordMessage(channel, "No se encontraron resultados <@"+userID+"> :c");
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

            case 'tacosarabes':
            case 'factor':
                var year = new Date();
                year = year.getFullYear();
                var christmas  = new Date(year, 06, 26);
                var today = new Date();
                var until = Date.daysBetween(today, christmas);
                sendDiscordMessage(channel, 'Faltan '+until+' dias para LOS TACOS ARABES!');
                sendDiscordMessage(channel, '!aah');

                break;

            case 'navidad':
                var year = new Date();
                year = year.getFullYear();
                var christmas  = new Date(year, 11, 25);
                var today = new Date();
                var until = Date.daysBetween(today, christmas);
                sendDiscordMessage(channel, 'Faltan '+until+' dias para navida tio!');

                break;

            case 'smush':
                var smush  = new Date(2018, 11, 7);
                var today = new Date();
                if(today.getDate()){
                        sendDiscordMessage(channel, '!hoy');
                  break;
                }
                smush.setHours(0);
                var until = Date.timeBetween(today, smush);
                sendDiscordMessage(channel, 'Faltan '+until+' para Super Smash Bros. Ultimate tio!');

                break;

            case 'melee':
            case 'marioparty':
            case 'comida':
            case 'expresopolar':
            case 'papaasada':
                var now  = new Date();
                var day = (now.getHours() >= 13) ? now.getDate() + 1 : now.getDate();
                var meleeHour = new Date(now.getFullYear(), now.getMonth(), day);
                meleeHour.setHours  (13)
                var until = Date.timeBetween(now, meleeHour);
                if(until.substring(0,2)>21){
                     sendDiscordMessage(channel, 'Ya es la hora de '+cmd+' tio');
                }else{
                    sendDiscordMessage(channel, 'Faltan '+until+' para el '+cmd+' tio!');
                }

                break;

            case 'random':
                var length = args.length;
                var index = Math.floor((Math.random() * length) + 0);
                sendDiscordMessage(channel, 'El resultados es '+args[index]+' tios!');
                break;

            case 'source':
                switch(args[0]){
                    case 'create':
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
                                    sendDiscordMessage(channel, "El source esta listo pa usarse tio");
                                });
                            }else{
                                    sendDiscordMessage(channel, "ese source ya existe weon >:-(");
                            }
                        });
                    break;

                    case 'delete':
                        var sql = "DELETE FROM source WHERE command = '"+args[1]+"'";
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            sendDiscordMessage(channel, "Se elimino el source :(");
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
                            sendDiscordMessage(channel, "Se edito el source :poggers:");

                        });
                    break;

                    case 'sourcelist':
                        var sql = "SELECT command from source";
                        con.query(sql, function (err, result) {
                            if (err) throw err; 
                            var message = "";
                            for(var i = 0; i<result.length; i++){
                              message += " !"+result[i].command+",";
                            }
                            sendDiscordMessage(channel, message);
                        });
                    break;

                    default:
                    	console.log("aaaaa");
                        var sql = "SELECT source from source where INSTR('"+message+"', command) > 0";
                        con.query(sql, function (err, result, fields) {
                            if (err) throw err;
                            if(result == null || result.length < 1){
                            }else{
                                sendDiscordMessage(channel, result[0].source);
                            }
                        });
                    break;
                }

                break;

                default:
                    for(var i = 0; i<noncutargs.length; i++){
                        var sql = "SELECT source FROM source WHERE command COLLATE latin1_general_cs = '"+noncutargs[i]+"'";
                        con.query(sql, function (err, result, fields) {
                            if (err) throw err;
                            if(result == null || result.length < 1){
                            }else{
                                sendDiscordMessage(channel, result[0].source);
                            }
                        });
                    }
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

function sendDiscordMessage(channel, message){
    try{
        channel.send(message);
    }catch(ex){
        sendErrorMessage(ex);
    }
}

function sendErrorMessage(ex){
    client.channels.get("512056426001203240").send("Hugo, hubo un error, pero aqui esta: "+ex);
}

function createEmbeded(title, titleUrl, author, authorImage, authorUrl, description, thumbnail, comment = ""){
    
    var exampleEmbed = new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setURL(titleUrl)
    .setAuthor(author, authorImage, authorUrl)
    .setDescription(description)
    .setThumbnail(thumbnail)
    .setTimestamp();
    if(comment != ""){
        exampleEmbed.addField('Comentario:', '"'+comment+'"')
    }

    return exampleEmbed
}
