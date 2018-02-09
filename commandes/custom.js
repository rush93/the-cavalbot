const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de customiser le nom du rang actif.',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande custom", "", message.author, [{
            title: Constants.prefix + 'custom <nom>',
            text: "Permet de customiser le nom du rang actif",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var clan = Clans.getPlayerClan(message.member);
        if (!clan) {
            Utils.reply(message, "Vous devez être dans un clan pour cela.", true);
            return;
        }
        var player = Players.getPlayer(message.member.id, clan.id);
        if (!player) {
            Utils.reply(message, "Vous n'avez pas de rang actif.", true);
            return;
        }
        var rank = Ranks.getRank(clan.id, player.activeRank ? player.activeRank.name : '');
        if (!rank) {
            Utils.reply(message, "Vous n'avez pas de rang actif.", true);
            return;
        }
        if (!rank.isCustomable) {
            Utils.reply(message, "Votre rang actif ne permet pas la modification du nom.", true);
            return;
        }
        var promise = Players.setDisplayRank(message.member, rank, args.join(' '));
        if (promise) {
            promise.catch(() => {
                Utils.reply(message, 'Aie tu est trop puissant pour moi, je peu pas changer ton pseudo.', true);
            });
        }
        Utils.reply(message, 'Votre rang actif est maintenant **' + args.join(' ') + '**.');
    }
}