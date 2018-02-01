const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet de donner des points à un joueur.',
    help: function(message) {
        Utils.sendEmbed(message, 0x00AFFF,"Utilisation de la commande givepoints", "", message.author, [{
            title: Constants.prefix + 'givepoints <points>',
            text: "Permet de donner des points à un joueur.",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var member = message.mentions.members.first();
        if (!member) {
            Utils.reply(message, "Vous devez mensionnez un utilisateur", true);
            return;
        }
        var points = Number(args[1]);
        if(isNaN(points)) {
            Utils.reply(message, 'Le nombre de points dois être un nombre.', true);
            return;
        }
        var player = Players.getPlayer(member.id)
        var oldPoints = 0;
        if (player)
            oldPoints = player.points;
        if (!oldPoints)
            oldPoints = 0;
        var newPoints = oldPoints + points
        Players.setPoints(member.id, newPoints);
        Utils.reply(message, 'Les points du joueur on bien été modifier.');
        var playerClan = Clans.getPlayerClan(member);
        var avaliabeRanks = Ranks.getRanks(playerClan.id);
        var keys = Ranks.getSortedKeys(playerClan.id);
        var nextRank = null;
        for (var i = 0; i < keys.length; i++) {
            if (avaliabeRanks[keys[i]].points > oldPoints) {
                nextRank = avaliabeRanks[keys[i]];
                break;
            }
        }
        if(!nextRank) {
            return;
        }
        if (nextRank.points <= newPoints) {
            Utils.reply(message, `Bravo <@!${member.id}> tu as maintenant accès à un nouveau rang: **${nextRank.name}**.`);
        }
    }
}