const Utils = require('../utils');
var Constants = require('../models/constants');
var Messages = require('../models/messages')
var commands = {
    add: {
        help: [
            'Permet d\'ajouter un message automatique.'
        ],
        args: '<#channel> <time:\'3h\'> <message>',
        runCommand: (args, message) => {
          channel = message.mentions.channels.first();
          if (!channel) {
            Utils.reply(message, "Veuillez Mentionner un message.", true);
            return;
          }
          args.shift();
          let time = args.shift();
          const timeMap = {
            "s": 1000,
            "m": 1000 * 60,
            "h": 1000 * 60 * 60,
            "j": 1000 * 60 * 60 * 24
          }
          const timeModif = time.charAt(time.length - 1);
          time = Number(time.substring(0,time.length - 1));
          if (!timeMap[timeModif]) {
            Utils.reply(message, "Le format de la date n'est pas correct exemples de formats: 1s, 2m, 3h, 1j");
            return;
          }
          Messages.addMessage({
            time: time * timeMap[timeModif],
            channelId: channel.id,
            message: args.join(" ")
          });
          Utils.reply(message, "Le message automatique à bien été ajouté.");
        }
    },
    delete: {
      help: [
        'Permet de supprimer un message automatique.'
      ],
      args: '<index>',
      runCommand: (args, message) => {
        if (args.length < 0) {
          Utils.reply(message, "Vous devez indiquer l'index du message auto", true);
          return;
        }
        const index = Number(args[0]) - 1;
        if (isNaN(index) || index < 0 || index >= Messages.getAll().length) {
          Utils.reply(message, "L'index dois être compris entre 0 et " + Messages.getAll().length, true);
          return;
        }
        Messages.deleteMessage(index);
        Utils.reply(message, 'Le message a bien été supprimé.');
      }
    },
    list: {
      help: [
        'Permet de lister les messages automatiques'
      ],
      args: '',
      runCommand: (args, message) => {
        const fields = [];
        const messages = Messages.getAll()
        for(let i = 0; i < messages.length; i++) {
          let messageAuto = messages[i];
          channel = message.channel.guild.channels.get(messageAuto.channelId);
          fields.push({
            title: 'messages num ' + (i + 1) ,
            text: ` Dans: ${channel.name}
interval: ${ messageAuto.time}
${messageAuto.message}
`,
            grid: false,
          });
        }
        Utils.sendEmbed(message, 0x123456, "Liste des messages automatiques","", message.author, fields);
      }
    }
}
var help = function (message) {
    var keys = Object.keys(commands);
    var fields = [];
    keys.forEach((command, index) => {
        fields.push({
            text: commands[command].help,
            title: `${Constants.prefix}messages ${command} ${commands[command].args}`,
            grid: false
        });
    });
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes des messages autmatiques', "", message.author, fields);
}
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet d\'administrer les messages automatiques',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour administrer les messages automatiques", true);
            return;
        }
        if (commands[args[0]]) {
            var label = args[0];
            args.shift();
            commands[label].runCommand(args, message);
        } else {
            help(message);
        }
    }
}