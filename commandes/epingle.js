const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
module.exports = {
    role: 'MANAGE_NICKNAMES',
    helpCat: 'Permet d\'épingler un message',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande epingle", "", message.author, [{
            title: Constants.prefix + 'epingle <id_message>',
            text: "Permet d\'épingler un message",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_NICKNAMES")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour épingler un message", true);
            return;
        }
        if(args.length === 0) {
            Utils.reply(message, "Vous devez mettre l'id d'un message", true);
            return;
        }
        var toPin = message.channel.messages.get(args[0]);
        if (!toPin) {
            Utils.reply(message, "aucun message avec cet id dans ce channel.", true);
            return;
        }
        if (!toPin.pinned) {
            toPin.pin().then(() => {
                Utils.reply(message, "Le message à bien été épinglé.");
            }).catch((e) => {
                Utils.log(e, true);
                Utils.reply(message, "Euh wait il s'est passé quoi là ? J'ai pas réussi à le faire :/", true);
            });
            return;
        }
        toPin.unpin().then(() => {
            Utils.reply(message, "Le message n'est plus épinglé.");
        }).catch((e) => {
            Utils.log(e, true);
            Utils.reply(message, "Euh wait il s'est passé quoi là ? J'ai pas réussi à le faire :/", true);
        });
    }
}