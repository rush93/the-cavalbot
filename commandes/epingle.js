const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
module.exports = {
    role: 'MANAGE_ROLES',
    helpCat: 'Permet d\'épingler un message',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande epingle", "", message.author, [{
            title: Constants.prefix + 'epingle <id_message>',
            text: "Permet d\'épingler un message",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_ROLES")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour epingler un message", true);
            return;
        }
        if(args.length === 0) {
            Utils.reply(message, "Vous devez mettre l'id d'un message", true);
            return;
        }
        var toPin = message.channel.messages.get(args[0]);
        if (!toPin) {
            Utils.reply(message, "aucuns message avec cet id dans ce channel.", true);
            return;
        }
        if (!toPin.pinned) {
            toPin.pin().then(() => {
                Utils.reply(message, "Le message à bien été épingler.");
            }).catch((e) => {
                console.log(e);
                Utils.reply(message, "Euh wait il c'est passé quoi la ? j'ai pas réussi à le faire :/", true);
            });
            return;
        }
        toPin.unpin().then(() => {
            Utils.reply(message, "Le message n'est plus épingler.");
        }).catch((e) => {
            console.log(e);
            Utils.reply(message, "Euh wait il c'est passé quoi la ? j'ai pas réussi à le faire :/", true);
        });
    }
}