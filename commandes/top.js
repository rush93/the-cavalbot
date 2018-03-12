const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');

module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Affiche le classement des joueurs dans un clan.',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande top", "", message.author, [{
            title: Constants.prefix + 'top <clan> [page]',
            text: "Affiche le classement des joueurs dans un clan.",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var page = Number(args[args.length - 1]);
        if (isNaN(page)) {
            page = null;
        }
        if (page != null) {
            args.pop();
        }
        var role = Clans.getRoleByName(args.join(' '), message.channel.guild);
        if (!role && page) {
            args.push(page);
            var role = Clans.getRoleByName(args.join(' '), message.channel.guild);
            if (!role) {
                Utils.reply(message, "Aucuns clans avec ce nom.", true);
                return;
            }
            page = 1;
        } else if(!role) {
            Utils.reply(message, "Aucuns clans avec ce nom.", true);
            return;
        }
        if (!page) {
            page = 1;
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
            if (member && players[keys[i]].clans[role.id]) {
                teamPlayers.push(players[keys[i]].clans[role.id]);
            }
        }
        var sortedPlayers = teamPlayers.sort(function (a, b) {
            var p1 = a.points ? a.points : 0;
            var p2 = b.points ? b.points : 0;
            return p1 - p2;
        });
        sortedPlayers = sortedPlayers.reverse();
        var fields = [];
        var nbPerPage = 10;
        if (sortedPlayers.length < nbPerPage * (page - 1)) {
            Utils.reply(message, "Aucune page numéro " + page);
            return;
        }
        for (var i = nbPerPage * (page - 1); i < sortedPlayers.length && i < nbPerPage * page; i++) {
            var guildMember = role.members.get(sortedPlayers[i].id);
            fields.push({
                title: ((i + 1) === 1 ? '1er: ' : (i+1) +'e: ') + (guildMember.nickname ? guildMember.nickname : guildMember.user.username),
                text: (sortedPlayers[i].points ? sortedPlayers[i].points : 0) + " points",
                grid: true
            });
        }
        if (i < sortedPlayers.length) {
            fields.push({
                title: "page " + page,
                text: `Faites **${Constants.prefix}top ${args.join(' ')} ${page + 1}** pour voir la suite.`
            });
        }
        var totalPoints = Utils.getScoreOfClan(Players, clan.id, Clans);
        var image = Constants.domain + '/images/clan?c=' + clan.id + '&s=' + totalPoints;
        Utils.sendEmbed(message, role.color, 'Classements du clan ' + role.name, '', message.author, fields, image, 10);
    }
}