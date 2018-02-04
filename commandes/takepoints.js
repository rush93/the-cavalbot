const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet de retirer des points à un joueur.',
    help: function(message) {
        Utils.sendEmbed(message, 0x00AFFF,"Utilisation de la commande takepoints", "", message.author, [{
            title: Constants.prefix + 'takepoints <points>',
            text: "Permet de retirer des points à un joueur.",
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

        var clanId = Clans.getPlayerClan(member).id;
        var oldPoints = Players.getPlayer(member.id, clanId).points;
        var newPoints = oldPoints - points
        Players.setPoints(member.id, clanId, newPoints);
        Utils.reply(message, 'Les points du joueur on bien été modifier.');
        var playerClan = Clans.getPlayerClan(member);
        var avaliabeRanks = Ranks.getRanks(playerClan.id);
        var keys = Ranks.getSortedKeys(playerClan.id);
        var nextRank = null;
        for (var i = keys.length - 1; i >= 0; i--) {
            if (avaliabeRanks[keys[i]].points < oldPoints) {
                nextRank = avaliabeRanks[keys[i]];
                break;
            }
        }
        if(!nextRank) {
            return;
        }
        if (nextRank.points >= newPoints) {
            member.removeRole(member.guild.roles.get(nextRank.roleId));
            Utils.reply(message, `Dommage <@!${member.id}> tu n'as maintenant plus accès au rang: **${nextRank.name}**.`);
        }
    }
}