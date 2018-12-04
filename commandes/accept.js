const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');
var moment = require('moment');

module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet d\'accepter une demande en mariage',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande accept", "", message.author, [{
            title: Constants.prefix + 'accept <@user>',
            text: "Permet d\'accepter une demande en mariage.",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var user1 = message.mentions.members.first();
        if (!user1) {
            Utils.reply(message, "Vous devez mentionner un joueur.", true);
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
        
        var roles = Utils.getRolesOfPerm(message.guild, 'KICK_MEMBERS');
        var str = [];
        for (var i = 0; i < roles.length; i++) {
            str.push(`<@&${roles[i].id}>`);
        }
        message.channel.send(str.join(', '));
        Players.setAskFor(user1, null);
        Utils.reply(message, `<@!${message.member.id}> et <@!${user1.id}> doivent se marier ! Ils ont besoin d'un curé et d'une cérémonie !`);
    }
}