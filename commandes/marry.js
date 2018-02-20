const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet de marier deux personnes',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande marry", "", message.author, [{
            title: Constants.prefix + 'marry <@user> <@user>',
            text: "Permet de marier deux personnes",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "Vous n'êtes pas assez religieux pour marier des gens.", true);
            return;
        }
        var user1 = message.mentions.members.first();
        var user2 = message.mentions.members.last();
        if (!user1 || !user2 || user1.id === user2.id) {
            Utils.reply(message, "Vous devez mentionner 2 joueurs", true);
            return;
        }
        if (Players.hasEpou(user1)) {
            Utils.reply(message, `<@!${user1.id}> à déjà un épou !`, true);
            return;
        }

        if (Players.hasEpou(user2)) {
            Utils.reply(message, `<@!${user2.id}> à déjà un épou !`, true);
            return;
        }
        Players.setEpou(user1, user2);
        Utils.reply(message, `:tada: <@!${user1.id}> et <@!${user2.id}> sont maintenant mariés ! :tada:`);
    }
}