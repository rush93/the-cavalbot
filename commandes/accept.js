const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');

module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet d\'accepter une demande en marriage',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande accept", "", message.author, [{
            title: Constants.prefix + 'accept <@user>',
            text: "Permet d\'accepter une demande en marriage",
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
            Utils.reply(message, `Vous êtes déjà marié !`, true);
            return;
        }
        if (Players.hasEpou(user1)) {
            Utils.reply(message, `<@!${user1.id}> à déjà un épou !`, true);
            return;
        }
        var roles = Utils.getRolesOfPerm(message.guild, 'MANAGE_GUILD');
        var str = [];
        for (var i = 0; i < roles.length; i++) {
            str.push(`<@&${roles[i].id}>`);
        }
        message.channel.send(str.join(', '));
        Players.setAskFor(user1, null);
        Utils.reply(message, `<@!${message.member.id}> et <@!${user1.id}> doivent se marier! ils ont besoin d'un curé et d'une cérémonie !`);
    }
}