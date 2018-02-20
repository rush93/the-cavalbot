const Discord = require('discord.js');
const bot = new Discord.Client();
const Utils = require('./utils');
var request = require('request');

var token = require('./token');

var globalConst = require('./models/constants');
var clans = require('./models/clans');
var players = require('./models/players');
var ranks = require('./models/ranks');
globalConst.init();
clans.init();
players.init();
ranks.init();

var configCommands = require('./commandes/config');
var clanCommands = require('./commandes/clan');
var listclanCommands = require('./commandes/list');
var infoClanCommands = require('./commandes/info');
var joinCommands = require('./commandes/join');
var leaveCommands = require('./commandes/leave');
var rangCommands = require('./commandes/rang');
var givepointsCommands = require('./commandes/givepoints');
var takepointsCommands = require('./commandes/takepoints');
var setrangCommands = require('./commandes/setrang');
var customCommands = require('./commandes/custom');
var topCommands = require('./commandes/top');
var btagCommands = require('./commandes/btag');
var psnCommands = require('./commandes/psn');
var epingleCommand = require('./commandes/epingle');
var marryCommand = require('./commandes/marry');
var divorceCommand = require('./commandes/divorce');
var proposeCommand = require('./commandes/propose');
var acceptCommand = require('./commandes/accept');
var declineCommand = require('./commandes/decline');

var commands = {
  config: configCommands,
  clan: clanCommands,
  rang: rangCommands,
  givepoints: givepointsCommands,
  takepoints: takepointsCommands,
  marry: marryCommand,
  divorce: divorceCommand,
  epingle: epingleCommand,
  list: listclanCommands,
  info: infoClanCommands,
  top: topCommands,
  join: joinCommands,
  leave: leaveCommands,
  setrang: setrangCommands,
  custom: customCommands,
  btag: btagCommands,
  psn: psnCommands,
  propose: proposeCommand,
  accept: acceptCommand,
  decline: declineCommand
}
try {
  bot.on('ready', function () {
    Utils.log(Utils.Color.FgGreen + 'bot started');
    bot.user.setActivity(globalConst.prefix + 'help pour la liste des commandes');
  });
} catch(e) {
  Utils.log(e, true);
}
try {

bot.on('message', function (message) {
  if (message.author.bot) {
    return;
  }
  if (message.channel.constructor.name === 'DMChannel') {
    Utils.log('', false, 'DM message', message.author.username, message.content);
    var player = players.getPlayers()[message.author.id];
    if (player && player.tempCode) {
      if (player.tempCode === Number(message.content)) {
        var role = clans.getRole(player.tempGuild, guild);
        var clan = clans.addPlayer(role, guild.members.get(player.id), 'à rejoins via le site', Object.keys(players.getPsns(player.id)).length > 0);
        players.setTempClanToJoin(message.author.id, null, null);
        if (!clan) {
          Utils.reply(message, 'Vous êtes deja dans un clan.', true);
          return;
        }
        Utils.reply(message, 'Code de confirmation correct, Vous avez bien rejoins les ' + role.name);
      } else {
        Utils.reply(message, "Le code est incorrect.", true);
      }
    } else {
      if (!guild.members.get(message.author.id).hasPermission("MANAGE_GUILD")) {
        return;
      }
      var result = /^say ([0-9]+) (.+)$/.exec(message.content);
      if (result) {
        var channel = guild.channels.get(result[1]);
        if (!channel) {
          Utils.reply(message, 'c\'est pas un channel ça', true);
          return;
        }
        channel.send(result[2]);
      }
    }
    return;
  }
  try {
    if (message.content.substring(0, globalConst.prefix.length) === globalConst.prefix) {
      var args = message.content.split(" ");
      Utils.log('Command detected', false, message.channel.name, message.member.user.username, message.content);
      if (args[0] === globalConst.prefix + 'help') {
        Utils.log(`running ${Utils.Color.FgYellow}help ${Utils.Color.Reset}command`);
        if (args.length > 1) {
          if (commands[args[1]] && message.member.hasPermission(commands[args[1]].role)) {
            commands[args[1]].help(message);
            return;
          }
          Utils.reply(message, `Aucune commande du nom de **${args[1]}**.`, true)
          return;
        }
        var keys = Object.keys(commands);
        var fields = [];
        keys.forEach((command) => {
          if (message.member.hasPermission(commands[command].role)) {
            fields.push({
              text: commands[command].helpCat,
              title: command,
              grid: false
            });
          }
        });
        Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes', "Pour plus d'info sur une commandes faites **" + globalConst.prefix + "help [commande]**", message.author, fields);
        return;
      }
      args[0] = args[0].replace(globalConst.prefix, '');
      if (commands[args[0]]) {
        var label = args[0];
        Utils.log(`running ${Utils.Color.FgYellow}${label} ${Utils.Color.Reset}command`);
        args.shift();
        commands[label].runCommand(args, message);
        return;
      }
    } else {
      var regex = /^(?:\*([^\*]*)\*)|^(?:\*([^ ]+))/;
      var result = regex.exec(message.content);
      if (result) {
        var word = result[1] ? result[1] : result[2];
        var url = `https://api.tenor.com/v1/random?media_filter=minimal&key=PLSS61YOD7KR&limit=1&q=anime%20${encodeURI(word)}`;
        var sendEmbedImage = (image) => {
          var embed = new Discord.RichEmbed({});
          embed.setColor(0x00AFFF);
          embed.setImage(image);
          return message.channel.send("", embed);
        }
        request({
          url: url
        }, function (error, response, body) {
          var result = JSON.parse(body);
          if (result.results && result.results.length > 0) {
            var gif = result.results[0].media[0].mediumgif.url;
            Utils.log('Gif detected and found', false, message.channel.name, message.member.user.username, message.content);
            sendEmbedImage(gif);
            return;
          } 
          var gif = "https://media.tenor.com/images/00631c571898fbaf0b75cedcbaf2135e/tenor.gif";
            Utils.log('Gif detected and not found', false, message.channel.name, message.member.user.username, message.content);
            sendEmbedImage(gif).then(message => {
              message.delete(1000);
          });
          
        });
      }
    }
  } catch (e) {
    Utils.log(e, true);
    Utils.reply(message, 'Aie..., j\'ai bugger. <@!270268597874589696> tu fait mal ton boulot! corrige moi ce bug tout de suite!', true)
  }
});
} catch (e) {
  Utils.log(e, true)
}

try {
  var guild = null;
  var api = require('./api/index');
  bot.login(token).then(token => {
    guild = bot.guilds.first();
    api.initServer(guild);
  }).catch((e) => {
    Utils.log(e, true);
  });
} catch (err) {
  Utils.log(err, true);
}
