const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');

module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Affiche le classement des joueurs dans un clan.',
    help: function(message) {
        Utils.sendEmbed(message, 0x00AFFF,"Utilisation de la commande top", "", message.author, [{
            title: Constants.prefix + 'top <@clan>',
            text: "Affiche le classement des joueurs dans un clan.",
            grid: false
        }]);
    },
    runCommand: (args, message) => {

        var role = Clans.getRoleByName(args.join(' '), message.channel.guild);
        if (!role) {
            Utils.reply(message, "Aucuns clans avec ce nom.", true);
            return;
        }
        var clan = Clans.getClan(role);
        if (!clan) {
            Utils.reply(message, "Aucuns clan pour ce role.", true);
            return;
        }
        var players = Players.getPlayers();
        var keys = Object.keys(players);
        var teamPlayers = [];
        for (var i = 0; i < keys.length; i++) {
            var member = role.members.get(keys[i]);
            if (member) {
                teamPlayers.push(players[keys[i]][role.id]);
            }
        }
        var sortedPlayers = teamPlayers.sort(function (a, b) {
            var p1 = a.points? a.points: 0;
            var p2 = b.points? b.points: 0;
            return p1 - p2;
        });
        sortedPlayers = sortedPlayers.reverse();
        var fields = [];
        for (var i=0; i < sortedPlayers.length; i++) {
            var guildMember = role.members.get(sortedPlayers[i].id);
            fields.push({
                title: guildMember.nickname ? guildMember.nickname : guildMember.user.username,
                text: (sortedPlayers[i].points ? sortedPlayers[i].points : 0) + " points",
                grid: true
            });
        }
        Utils.sendEmbed(message, role.color, 'Classements du clan ' + role.name, '', message.author, fields, clan.image);
    }
}