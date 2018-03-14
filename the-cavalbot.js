
const Discord = require('discord.js');
const bot = new Discord.Client();
const Utils = require('./utils');
var request = require('request');

var token = require('./token');

var globalConst = require('./models/constants');
var interactions = require('./models/interactions');
var clans = require('./models/clans');
var players = require('./models/players');
var ranks = require('./models/ranks');
var event = require('./models/event');
globalConst.init();
interactions.init();
clans.init();
players.init();
ranks.init();
event.init();

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
var seasonCommand = require('./commandes/season');
var eventCommand = require('./commandes/event');
var participeCommand = require('./commandes/participe');

var commands = {
  config: configCommands,
  clan: clanCommands,
  rang: rangCommands,
  givepoints: givepointsCommands,
  takepoints: takepointsCommands,
  marry: marryCommand,
  divorce: divorceCommand,
  season: seasonCommand,
  event: eventCommand,
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
  decline: declineCommand,
  participe: participeCommand
}
try {
  bot.on('ready', function () {
    Utils.log(Utils.Color.FgGreen + 'bot started');
    bot.user.setActivity(globalConst.prefix + 'help pour la liste des commandes');
  });
} catch (e) {
  Utils.log(e.stack, true);
}
try {

  bot.on('messageReactionAdd', function (messageReaction, user) {
    if (user.bot) {
      return;
    }
    var reactInteraction = interactions.getReactInteraction(user.id);
    if (reactInteraction) {
      var command = eval(reactInteraction.command + 'Command');
      if (reactInteraction.additionalArg) {
        command[reactInteraction.functionToCall](messageReaction, user, ...reactInteraction.additionalArg);
        return;
      }
      command[reactInteraction.functionToCall](messageReaction, user);
    }
  });
  
  bot.on('message', function (message) {
    try {
      if (message.author.bot) {
        return;
      }
      if (message.channel.constructor.name === 'DMChannel') {
        Utils.log('', false, 'DM message', message.author.username, message.content);
        var result = /^say ([0-9]+) (.+)$/.exec(message.content);
        if (result) {
          if (!guild.members.get(message.author.id).hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, 'ptdr t ki ?', true);
            return;
          }
          var channel = guild.channels.get(result[1]);
          if (!channel) {
            Utils.reply(message, 'c\'est pas un channel ça', true);
            return;
          }
          channel.send(result[2]);
        } else {
          var chatInteraction = interactions.getChatInteraction(message.author.id);
          if (chatInteraction) {
            var command = eval(chatInteraction.command + 'Command');
            if (chatInteraction.additionalArg) {
              command[chatInteraction.functionToCall](message, ...chatInteraction.additionalArg);
              return;
            }
            command[chatInteraction.functionToCall](message);
          }
        }
        if (message.content.substr(0, globalConst.prefix.length) === globalConst.prefix) {
          Utils.sendDM(message.author, `Désolé mais c'est pas encore possible d'utiliser les commandes en mp.
C'est une fonctionalitée qui est prévu, mais comme il y a d'autre prioritée et bah ça n'a pas encore été dev.
après tu peu toujours le dev toi même si tu veux, vue que le code est open source.
mais bon entre nous même si tu est timide personne ne t'en voudra si tu fait ${message.content} dans le channel de bot ;)`, true);
        }
        return;
      }
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
      Utils.log(e.stack, true);
      message.channel.send('<@!270268597874589696>');
      Utils.reply(message, 'Aie..., j\'ai bugger. <@!270268597874589696> tu fait mal ton boulot! corrige moi ce bug tout de suite!', true)
    }
  });
} catch (e) {
  Utils.log(e.stack, true)
}

try {
  var guild = null;
  var api = require('./api/index');
  bot.login(token).then(token => {
    guild = bot.guilds.first();
    api.initServer(guild);
  }).catch((e) => {
    Utils.log(e, true);
  })
  bot.on('error', (err) => {
    Utils.log(err.stack, true);
  });
} catch (err) {
  Utils.log(err.stack, true);
}
