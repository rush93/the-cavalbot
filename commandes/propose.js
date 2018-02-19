const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de demander une personne en marriage',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande propose", "", message.author, [{
            title: Constants.prefix + 'propose <@user>',
            text: "Permet de demander une personne en marriage",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var user1 = message.mentions.members.first();
        if (!user1) {
            Utils.reply(message, "Vous devez mentionner un joueur", true);
            return;
        }
        if (Players.hasEpou(message.member)) {
            Utils.reply(message, `Vous êtes déjà marié !`, true);
            return;
        }
        if (Players.hasEpou(user1)) {
            Utils.reply(message, `<@!${user1.id}> à déjà un(e) épou(se) !`, true);
            return;
        }

        var askfor = Players.getAskFor(message.member);
        if (askfor && user1.id === askfor) {
            Utils.reply(message, `Vous avez l'avez déjà demandé veuillez attendre sa réponse.`, true);
            return;
        }
        
        Players.setAskFor(message.member, user1);
        Utils.reply(message, `<@!${user1.id}>, <@!${message.member.id}> vous demande en mariage:
    - voulez vous accepter ? ( **${Constants.prefix}accept <@!${message.member.id}>** )
    - ou voulez vous refuser ? ( **${Constants.prefix}decline <@!${message.member.id}>** )`);
    }
}