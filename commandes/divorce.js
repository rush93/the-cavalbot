const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet de divorcer deux personnes',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande divorce", "", message.author, [{
            title: Constants.prefix + 'divorce <@user> <@user>',
            text: "Permet de divorcer deux personnes",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "Il vous faut appeler un juge pour divorcer.", true);
            return;
        }
        var user1 = message.mentions.members.first();
        var user2 = message.mentions.members.last();
        if (!user1 || !user2 || user1.id === user2.id) {
            Utils.reply(message, "Vous devez mentionner 2 joueurs", true);
            return;
        }
        if (!Players.hasEpou(user1)) {
            Utils.reply(message, `<@!${user1.id}> n'as pas d'épou !`, true);
            return;
        }

        if (!Players.hasEpou(user2)) {
            Utils.reply(message, `<@!${user2.id}> n'as pas d'épou !`, true);
            return;
        }
        if (Players.getEpou(user1) !== Players.getEpou(user1)) {
            Utils.reply(message, `Les deux joueurs ne sont pas marié.`, true);
            return;
        }
        Players.divorse(user1, user2);
        Utils.reply(message, `<@!${user1.id}> et <@!${user2.id}> ont divorcé !`);
    }
}