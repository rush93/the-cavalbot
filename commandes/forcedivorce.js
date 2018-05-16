const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet de forcer le divorce en cas de soucis',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande forcedivorce", "", message.author, [{
            title: Constants.prefix + 'forcedivorce <@user>',
            text: "Permet de forcer le divorce en cas de soucis",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "Vous ne pouvez pas forcer le divorce ! Nameho !", true);
            return;
        }
        var user = message.mentions.members.first();
        if (!user) {
            Utils.reply(message, "Vous devez mentionner 1 joueur", true);
            return;
        }
        if (!Players.hasEpou(user)) {
            Utils.reply(message, `<@!${user.id}> n'a pas d'époux !`, true);
            return;
        }

        Players.divorse(user);
        Utils.reply(message, `<@!${user.id}> n'est plus marié !`);
    }
}