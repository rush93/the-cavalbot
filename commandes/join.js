const Discord = require('discord.js');
const Utils = require('../utils');
var Clans = require('../models/clans');
var Players = require('../models/players');
var Constants = require('../models/constants');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de rejoindre un clan',
    help: function(message) {
        Utils.sendEmbed(message, 0x00AFFF,"Utilisation de la commande join", "", message.author, [{
            title: Constants.prefix + 'join <@clan>',
            text: "Permet de rejoindre un clan",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var role = Clans.getRoleByName(args.join(' '), message.channel.guild);
        if (!role) {
            Utils.reply(message, "Aucuns role avec ce nom", true);
            return;
        }
        var clan = Clans.getClan(role);
        if (!clan) {
            Utils.reply(message, "Aucuns clan pour ce role.", true);
            return;
        }
        clan = Clans.addPlayer(role, message.member, "rejoins le clan avec la commande join");
        if (!clan) {
            Utils.reply(message, "Vous êtes déjà dans un clan.", true);
            return;
        }
        Players.setCooldown(message.member);
        Utils.reply(message, "Vous avez bien rejoins le clan " + role.name);
    }
}