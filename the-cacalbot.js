const Discord = require('discord.js');
const bot = new Discord.Client();
const Utils = require('./utils');
var request = require('request');
var moment = require('moment');

var token = require('./token');

var globalConst = require('./models/constants');
var interactions = require('./models/interactions');
var clans = require('./models/clans');
var players = require('./models/players');
var ranks = require('./models/ranks');
var event = require('./models/event');
var messages = require('./models/messages');
var mission = require('./models/mission');
//var bdd = require('./models/connectionMYSQL');
globalConst.init();
interactions.init();
clans.init();
players.init();
ranks.init();
event.init();
messages.init();
//bdd.init();
mission.init();

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
var forcedivorceCommand = require('./commandes/forcedivorce');
var proposeCommand = require('./commandes/propose');
var acceptCommand = require('./commandes/accept');
var declineCommand = require('./commandes/decline');
var seasonCommand = require('./commandes/season');
var eventCommand = require('./commandes/event');
var participeCommand = require('./commandes/participe');
var reportCommand = require('./commandes/report');
var testCommand = require('./commandes/test');
var roleCommand = require('./commandes/role');
var cooldownClanCommand = require('./commandes/cooldownClan');
var pingCommand = require('./commandes/ping');
var exilCommand = require('./commandes/exil');
var messagesCommand = require('./commandes/messages');
var missionCommand = require('./commandes/mission');

var commands = {
  config: configCommands,
  clan: clanCommands,
  rang: rangCommands,
  givepoints: givepointsCommands,
  takepoints: takepointsCommands,
  marry: marryCommand,
  divorce: divorceCommand,
  forcedivorce: forcedivorceCommand,
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
  participe: participeCommand,
  report: reportCommand,
  test: testCommand,
  role: roleCommand,
  cooldownClan: cooldownClanCommand,
  ping: pingCommand,
  exil: exilCommand,
  messages: messagesCommand,
  mission: missionCommand
}

var intervalMessage = require('./intervals/messages');

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
    var reactInteraction = interactions.getReactInteraction(messageReaction.message.id);
    if (reactInteraction) {
      var command = eval(reactInteraction.command + 'Command');
      if (reactInteraction.additionalArg) {
        command[reactInteraction.functionToCall](messageReaction, user, ...reactInteraction.additionalArg);
        return;
      }
      command[reactInteraction.functionToCall](messageReaction, user);
    } else {
      reactInteraction = interactions.getReactInteraction(user.id);
      if (reactInteraction) {
        var command = eval(reactInteraction.command + 'Command');
        if (reactInteraction.additionalArg) {
          command[reactInteraction.functionToCall](messageReaction, user, ...reactInteraction.additionalArg);
          return;
        }
        command[reactInteraction.functionToCall](messageReaction, user);
      }
    }
  });



  bot.on("guildMemberRemove", (member) => {
    var joinAT = moment(member.joinedAt);
    var now = moment();
    var diff = Math.abs(now.diff(joinAT, 'minutes'));
    moment.locale('fr');
    member.guild.channels.get("443199155838648320").send(`${member} (${member.user.username}) nous a quitté, il a été avec nous pendant `+ moment.duration(diff, 'minutes').humanize() );

    try {
      var clanId = clans.getPlayerClan(member).id;
      var clan = clans.getPlayerClan(member);
      var player = players.getPlayer(member.id, clanId);
      players.resetRank(member, clan);
      players.setPoints(member.id, clanId, 0);
      //players.setCooldown(member);
    }
    catch(error) {
      Utils.log(error, true);
    }

  });

  bot.on('guildMemberAdd', (member) => {

    let GuestsRole = member.guild.roles.find("name", "Guests");
    member.addRole(GuestsRole);
    Utils.log(`running ${Utils.Color.FgYellow}welcome ${Utils.Color.Reset}message`);
    Utils.sendDM(member,"Bienvenue sur OwAssembly, le serveur qui reproduit l'ambiance du jeu à travers son système de clans et ses multiples évènements!"
+"\nCe serveur n'a pas de vocation compétitive ou professionnelle. Si c'est ton but, nous t'invitons à aller visiter le discord de notre partenaire OverTown."

+"\n\nAvant toute chose:"
+"\nPrends connaissance des quelques règles du serveur, elles se trouvent dans  #📋règlements ."
+"\nChoisis ton clan parmi les 9 que le serveur propose et participe avec les autres membres à la course aux points!"
+"\nL'histoire des différents clans se trouve sur notre site internet (http://overwatch-assemble.fr/)."
+"\nLe clan Shambali est celui qu'il te faut si tu souhaites être simple observateur et ne participer à aucun évènement."

+"\n\nLe bot Athena est à ta disposition à tout moment et peut te fournir un grand nombre d'informations."
+"\nPour interagir avec lui, rends toi dans #bot-en-kaou-tchou ."
+"\nLes deux premières commandes qui t'intéresseront sont le _help (liste des commandes du bot) et le _btag pour renseigner ton identifiant Battle.net et ainsi pouvoir participer aux divers évènements.Tu trouveras sur notre serveur plusieurs types d'évènements auquel tu peux facilement participer, et notamment :"
+"\n:small_orange_diamond: Des mini-jeux de toutes sortes : le planning des mini-jeux se trouve dans #annonces-mini-jeux (épinglé). Pour participer, il te suffit de te rendre dans #bot-en-kaou-tchou et de taper la commande _participe"
+"\n:small_orange_diamond: Des guerres de clan : les clans s'affrontent pendant une saison de 2 mois pour défendre leurs orbes et s'emparer de celle des autres clans! Les règles de cet affrontement se trouvent sur le site dans l'onglet GDC.small_orange_diamond: Des tournois : Une fois par mois, un grand tournoi vise à départager la meilleure équipe! Celle-ci remporte un grade \"Vainqueurs du tournoi\" durant le mois suivant. Les règles de cet évènement sont postées avant chaque nouveau tournoi dans #tournois-gdc .");


    member.setNickname(member.displayName);
    if (globalConst.bvnChannel != "") {
      member.guild.channels.get(globalConst.bvnChannel).send(`Bienvenue à toi ${member},
Je viens de t'envoyer un message privé, prend le temps de le lire :smiley:.
Si tu as des questions ou si tu souhaites une présentation plus poussée du serveur, n'hésite pas à contacter un modérateur ou un membre du staff. Nous te souhaitons encore une fois la bienvenue et nous espérons que tu tu te plairas sur notre serveur!
L'équipe d'OA
Et n'oublie pas de choisir ton clan parmi la liste si dessous :`).then((msg) => {
        commands["list"].runCommand('list', msg);
      });
    }
  });// fin bot.on

  var runCommand = (args, message) => {
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
  }

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
            Utils.reply(message, 'ptdr t ki ?', true);
            return;
          }
          var channel = guild.channels.get(result[1]);
          if (!channel) {
            Utils.reply(message, 'c\'est pas un channel ça', true);
            return;
          }
          channel.send(result[2]);
        } else {
          var chatInteraction = interactions.getChatInteraction(message.author.id, null);
          if (chatInteraction) {
            var command = eval(chatInteraction.command + 'Command');
            if (chatInteraction.additionalArg) {
              command[chatInteraction.functionToCall](message, ...chatInteraction.additionalArg);
              return;
            }
            command[chatInteraction.functionToCall](message);
          } else {
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

      if(globalConst.guildID == ""){
        if(message.content.startsWith(globalConst.prefix+"config guildID") || message.content.startsWith(globalConst.prefix+"config prefix")){

        }else{
          Utils.reply(message, 'Administrateur !!!!! veuillez me configuez _config guildID [id], attention pas le droit à l\'erreur.', true);
          return;
        }
        
      }else {
        if (globalConst.guildID != message.guild.id && globalConst.guildID != "") {
            Utils.reply(message, "Attention une seul instance par serveur, veuillez contacter aejii#1262 et me kicker, ou je détruit ce serveur mouahahahahaha.", true);
            return;
        }
      }
      
      if (message.content.substring(0, globalConst.prefix.length) === globalConst.prefix) {
        var args = message.content.split(" ");
        Utils.log('Command detected', false, message.channel.name, message.author.username, message.content, guild);
        Utils.log(`fetching for ${Utils.Color.FgYellow}${message.author.username}${Utils.Color.Reset}`);
        message.channel.guild.fetchMember(message.author.id).then(member => {
          message.member = member
          runCommand(args, message);
        }).catch((e) => {
          Utils.log(e.stack, true);
        });
        return;
      } else if (/^\*suicide( |$)/i.exec(message.content)) {//https://giphy.com/gifs/season-9-episode-15-bravo-xUA7b4ALChx9x5kJ8c
        var embed = new Discord.RichEmbed({});
        embed.setColor(0x00AFFF);
        embed.setImage("https://cdn.discordapp.com/attachments/327039523156656128/451056132182769675/giphy.gif");
        return message.channel.send("", embed);
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
              Utils.log('Gif detected and found', false, message.channel.name, message.member.user.username, message.content, guild);
              sendEmbedImage(gif);
              return;
            }
            var gif = "https://media.tenor.com/images/00631c571898fbaf0b75cedcbaf2135e/tenor.gif";
            Utils.log('Gif detected and not found', false, message.channel.name, message.member.user.username, message.content, guild);
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
} catch(e) {
  Utils.log(e.stack, true)
}

try {
  var guild = null;
  var api = require('./api/index');
  bot.login(token).then(token => {
    guild = bot.guilds.first();
    api.initServer(guild);
    intervalMessage(messages, guild);
  }).catch((e) => {
    Utils.log(e, true);
  })
  bot.on('error', (err) => {
    Utils.log(err.stack, true);
  });
} catch (err) {
  Utils.log(err.stack, true);
}