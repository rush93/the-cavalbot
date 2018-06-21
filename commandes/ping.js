const Discord = require('discord.js');
const Utils = require('../utils');

module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de connaitre le ping du bot :P',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande ping", "", message.author, [{
            title: Constants.prefix + 'ping',
            text: "Permet de connaitre le ping du bot",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var dateee = new Date().getTime() - message.createdTimestamp
        Utils.reply(message, `pong : `+dateee+" ms");
    }
}