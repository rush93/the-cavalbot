const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');
var moment = require('moment');

module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de demander une personne en mariage',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande propose", "", message.author, [{
            title: Constants.prefix + 'propose <@user>',
            text: "Permet de demander une personne en mariage",
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
        if (Players.hasEpou(message.member)) {
            Utils.reply(message, `Vous êtes déjà marié !`, true);
            return;
        }
        if (Players.hasEpou(user1)) {
            Utils.reply(message, `<@!${user1.id}> a déjà un(e) épou(se) !`, true);
            return;
        }

        var askfor = Players.getAskFor(message.member);
        if (askfor && user1.id === askfor) {
            Utils.reply(message, `Vous l'avez déjà demandé veuillez attendre sa réponse.`, true);
            return;
        }
        var lastJoin = Players.getPlayers()[message.member.id] ? Players.getPlayers()[message.member.id].cooldownMariage : null;
        if (lastJoin) {
            lastJoin = moment(lastJoin);
            var now = moment();
            diff = Math.abs(now.diff(lastJoin, 'minutes'));
            if (diff < Constants.mariageCooldown) {
                var timeLeft = Constants.mariageCooldown - diff;
                moment.locale('fr');
                Utils.reply(message, 'Après une longue et douloureuse séparation vous avez besoin de temps pour vous remettre encore ' + moment.duration(timeLeft, 'minutes').humanize()) + ")";
                return;
            }
        }   
        Players.setCooldownMariage(message.member);
        Players.setAskFor(message.member, user1);
        Utils.reply(message, `<@!${user1.id}>, <@!${message.member.id}> vous demande en mariage:
    - Voulez-vous accepter ? ( **${Constants.prefix}accept <@!${message.member.id}>** )
    - Ou voulez-vous refuser ? ( **${Constants.prefix}decline <@!${message.member.id}>** )`);
    }
}