const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');

module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de refuser une demande en mariage',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande decline", "", message.author, [{
            title: Constants.prefix + 'decline <@user>',
            text: "Permet de refuser une demande en mariage",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var user1 = message.mentions.members.first();
        if (!user1) {
            Utils.reply(message, "Vous devez mentionner un joueur", true);
            return;
        }
        if ( message.member.id === user1.id) {
            Utils.reply(message, `Non désolé mais le célibat à vie c'est pas possible.`, true);
            return;
        }
        var askfor = Players.getAskFor(user1);
        if (!askfor || message.member.id !== askfor) {
            Utils.reply(message, `Désolé mais vous n'avez pas reçu de demande en mariage de cette personne.`, true);
            return;
        }
        if (Players.hasEpou(message.member)) {
            Utils.reply(message, `Vous êtes déjà mariés !`, true);
            return;
        }
        if (Players.hasEpou(user1)) {
            Utils.reply(message, `<@!${user1.id}> a déjà un époux !`, true);
            return;
        }
        Players.setAskFor(user1, null);
        Utils.reply(message, `Vous avez dit non à la demande en mariage, <@!${user1.id}> peut aller se recoucher.`);
    }
}