const Discord = require('discord.js');
const bot = new Discord.Client();
const Utils = require('./utils');

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
var rankCommands = require('./commandes/rank');
var givepointsCommands = require('./commandes/givepoints');
var takepointsCommands = require('./commandes/takepoints');
var setrankCommands = require('./commandes/setrank');
var customCommands = require('./commandes/custom');
var rangCommands = require('./commandes/rang');
var topCommands = require('./commandes/top');

var commands = {
  config: configCommands,
  clan: clanCommands,
  rank: rankCommands,
  givepoints: givepointsCommands,
  takepoints: takepointsCommands,
  list: listclanCommands,
  info: infoClanCommands,
  join: joinCommands,
  leave: leaveCommands,
  setrank: setrankCommands,
  custom: customCommands,
  rang: rangCommands,
  top: topCommands
}

bot.on('ready', function () {
  console.log('bot started');
  bot.user.setActivity(globalConst.prefix + 'help pour la liste des commandes');
});

bot.on('message', function (message) {
  try {
    if (message.content.substring(0, globalConst.prefix.length) === globalConst.prefix) {
      var args = message.content.split(" ");
      if (args[0] === globalConst.prefix + 'help') {
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
        args.shift();
        commands[label].runCommand(args, message);
        return;
      }
    }
  } catch (e) {
    console.error(e);
    Utils.reply(message, 'Aie..., j\'ai bugger. <@!270268597874589696> tu fait mal ton boulot! corrige moi ce bug tout de suite!', true)
  }
});

bot.login(token).catch((e) => {
  console.error(e);
});