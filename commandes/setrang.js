const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de changer le rang actif.',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande setrang", "", message.author, [{
            title: Constants.prefix + 'setrang <rang>',
            text: "Permet de changer le rang actif.",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var clan = Clans.getPlayerClan(message.member);
        if (!clan) {
            Utils.reply(message, "Vous devez être dans un clan pour cela.", true);
            return;
        }
        var rang = Ranks.getRank(clan.id, args.join(' '));
        if (!rang) {
            Utils.reply(message, "Aucuns rang porte ce nom dans votre clan.", true);
            return;
        }
        var player = Players.getPlayer(message.member.id, clan.id);
        if (!player || player.points < rang.points) {
            Utils.reply(message, `Vous n'avez pas assez de points pour rejoindre le clan **${rang.name}**,
il vous en faut **${rang.points}** et vous en avez **${(player && player.points) ? player.points : 0}**.`, true);
            return;
        }
        var promise = Players.setActiveRank(message.member, rang);
        if (promise) {
            promise.catch((e) => {
                console.error(e);
                if (e.code === 0) {
                    Utils.reply(message, 'Aie tu est trop puissant pour moi, je peu pas changer ton pseudo.', true);
                } else {
                    Utils.reply(message, 'Et la c\'est le bug #google.', true);
                }
            });
        }
        Utils.reply(message, 'Votre rang actif est maintenant **' + rang.name + '**.');
    }
}