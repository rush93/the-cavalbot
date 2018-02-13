const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de changer son psn.',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande psn", "", message.author, [{
            title: Constants.prefix + 'psn <psn>',
            text: "Permet de changer son psn.",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (args.length < 1) {
            Utils.reply(message, 'Vous devez mettre un psn', true);
            return;
        }

        var psns = Players.getPsns(message.member.id)
        if(psns && psns[args.join(' ')]) {
            Players.setPsn(message.member.id, args.join(' '));
            Utils.reply(message, 'Votre PSN a bien été supprimé.');
            return;
        }
        Players.setPsn(message.member.id, args.join(' ')).then(() => {
            Utils.reply(message, 'Votre PSN a été mis à jour.');
        }).catch((e) => {
            console.log(e);
            Utils.reply(message, 'Votre PSN est introuvable.');
        });
        Utils.reply(message, 'Recherche sur le Playstation network...');
    }
}