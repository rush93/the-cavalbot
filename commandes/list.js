const Discord = require('discord.js');
const Utils = require('../utils');
var Clans = require('../models/clans');
var Players = require('../models/players');
var Constants = require('../models/constants');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet d\'afficher la liste des clans',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande list", "", message.author, [{
            title: Constants.prefix + 'list',
            text: "Permet d\'afficher la liste des clans",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var fields = [];
        var scores = {};
        var players = Players.getPlayers();
        var PlayerKeys = Object.keys(players);
        for (var i = 0; i < PlayerKeys.length; i++) {
            var objectKeys = Object.keys(players[PlayerKeys[i]].clans);
            for (var j = 0; j < objectKeys.length; j++) {
                if (typeof(players[PlayerKeys[i]].clans[objectKeys[j]]) === "object") {
                    if (!scores[objectKeys[j]]) {
                        scores[objectKeys[j]] = 0;
                    }
                    if (players[PlayerKeys[i]].clans[objectKeys[j]]) {
                        scores[objectKeys[j]]+= players[PlayerKeys[i]].clans[objectKeys[j]].points;
                    }
                }
            }
        }
        var keys = Object.keys(Clans.clans);
        for (var i = 0; i < keys.length; i++) {
            var guildRole = message.guild.roles.get(keys[i])
            fields.push({
                title: guildRole.name,
                text: `**Nombre de joueurs:** ${guildRole.members.array().length}
**Score du clan:** ${scores[guildRole.id] ? scores[guildRole.id] : 0}
${Clans.getClan(guildRole).description ? Clans.getClan(guildRole).description : ''}`,
                grid: true
            });
        }
        Utils.sendEmbed(message, 0xE8C408, "Liste des clans", "", message.author, fields);
    }
}