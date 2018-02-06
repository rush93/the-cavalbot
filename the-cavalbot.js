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
var btagCommands = require('./commandes/btag');
var psnCommands = require('./commandes/psn');

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
  btag: btagCommands,
  psn: psnCommands
}

bot.on('ready', function () {
  console.log('bot started');
  bot.user.setActivity(globalConst.prefix + 'help pour la liste des commandes');
});

bot.on('message', function (message) {
  if (message.author.bot ) {
    return;
  }
  if(message.channel.constructor.name === 'DMChannel') {
    console.log('DM MESSAGE:' + message.content);
    var player = players.getPlayers()[message.author.id];
    if( player && player.tempCode) {
      if (player.tempCode === Number(message.content)) {
        var role = clans.getRole(player.tempGuild, guild);
        var clan = clans.addPlayer(role, guild.members.get(player.id), 'à rejoins via le site');
        players.setTempClanToJoin(message.author.id, null, null);
        if( !clan) {
          Utils.reply(message, 'Vous êtes deja dans un clan.', true);
          return;
        }
        Utils.reply(message, 'Code de confirmation correct, Vous avez bien rejoins les ' + role.name);
      } else {
        Utils.reply(message, "Le code est incorrect.", true);
      }
    }
    return;
  }
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

var guild = null;
bot.login(token).then(token => {
  guild = bot.guilds.first();
}).catch((e) => {
  console.error(e);
});

const express = require('express')
const pug = require('pug');
const app = express()
app.set('view engine', 'pug')
app.get('/', (req, res) => {
  res.render('index', { message: 'Veuillez entrer votre username discord' })
})

app.get('/choice', (req, res) => {
  var user = req.query.user;
  var username = req.query.username;
  if (user) {
    res.render('choice', { title: 'Hey', clans: clans.clans, Clans: clans, guild, user: user })
  } else if (username) {
    var member = guild.members.find(val => {
      return val.user.username === username || val.user.tag === username
    });
    if (member) {
      res.render('choice', { title: 'Hey', clans: clans.clans, Clans: clans, guild, user: member.id })
    } else {
      res.render('index', { message: 'Le username ' + username + ' est incorrect' })
    }
  } else {
    res.redirect('/');
  }
});

app.get('/clan', (req, res) => {
  var userId = req.query.u;
  var clanId = req.query.c;
  if (!userId || !clanId) {
    res.redirect('/');
    return;
  }
  var member = guild.members.get(userId);
  if (!member) {
    res.render('error', { message: 'AIE! une erreur est survenu... vous n\‘avez pas été trouvé en temps que membre' });
    return;
  }
  member.sendMessage("Une demande pour rejoindre le clan " + clans.getRole(clanId, guild).name + " a été faite, veuillez entrer le code de sécurité. Si cette demande n'as pas été faite par vous merci d'ignorer ce message.");
  var tempCode = Math.floor((Math.random() * 100000) + 1000);
  players.setTempClanToJoin(userId, clanId, tempCode);
  res.render('confirmCode', {code: tempCode});
});

app.listen(3000, () => console.log('The web server running on port 3000!'))