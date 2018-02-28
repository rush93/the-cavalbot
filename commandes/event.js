const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Clans = require('../models/clans');
var Players = require('../models/players');
var commands = {
    create: {
        help: [
            'Permet de créer un event.'
        ],
        args: '',
        runCommand: (args, message) => {
            
        }
    },
}
var help = function (message) {
    var keys = Object.keys(commands);
    var fields = [];
    keys.forEach((command, index) => {
        fields.push({
            text: commands[command].help,
            title: `${Constants.prefix}event ${command} ${commands[command].args}`,
            grid: false
        });
    });
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes des events', "", message.author, fields);
}
module.exports = {
    role: 'MANAGE_ROLES',
    helpCat: 'Permet d\'administrer les events',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_ROLES")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour toucher au events", true);
            return;
        }
        if (args.length < 1) {
            help(message);
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