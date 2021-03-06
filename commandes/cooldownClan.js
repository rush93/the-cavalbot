const Discord = require('discord.js');
var moment = require('moment');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet de mettre a jour les changements de clan par un admin',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande cooldownClan", "", message.author, [{
            title: Constants.prefix + 'cooldownClan @lapersonne',
            text: "modifier l'arrivé dans le clan et la remplacer par la date d'arriver sur le serveur",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "Mais arrete tu te fais du mal.", true);
            return;
        }
        var members = message.mentions.members;
        if (members.array().length === 1) {
            members.forEach((member) => {
                Players.setCooldownAdmin(member);
                Utils.reply(message, ":ok_hand:", true);
            });
        }else{
            Utils.reply(message, "faut @ quelqu'un (et seulement 1)", true);
        }
    }
}