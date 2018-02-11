const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');

var displayRoleOfClan = function (message, role) {
    var ranks = Ranks.getSortedKeys(role.id);
    var clan = Clans.getClan(role);
    var totalPoints = 0;
    var players = Players.getPlayers();
    var keys = Object.keys(players);
    for (var i = 0; i < keys.length; i++) {
        if(players[keys[i]] && players[keys[i]][clan.id]) {
            totalPoints+=players[keys[i]][clan.id].points;
        }
    }
    var fields = [
        {
            title: "Nombre de personnes",
            text: role.members.array().length,
            grid: true
        }, {
            title: "Total de points",
            text: totalPoints,
            grid: true
        }, {
            title: "Rangs",
            text: 'Tous les rangs du clan:',
            grid: false
        }
    ];
    for (var i = 0; i < ranks.length; i++) {
        var rank = Ranks.getRank(role.id, ranks[i]);
        fields.push({
            title: (rank.smiley ? rank.smiley + ' ' : '') + rank.name,
            text: rank.points + 'points',
            grid: true
        });
    }
    Utils.sendEmbed(message, role.color, "Clan " + role.name, clan.description ? clan.description : '', message.author, fields, clan.image);
    return;
}

var displayRoleOfMember = function (message, member) {
    var clan = Clans.getPlayerClan(member);
    if (!clan) {
        Utils.reply(message, 'Vous devez rejoindre un clan.', true);
        return;
    }
    var player = Players.getPlayer(member.id, clan.id);
    if (!clan) {
        Utils.reply(message, 'Cet personne n\'as pas de clan !');
        return
    }
    var role = Clans.getRole(clan.id, member.guild);
    var ranks = Ranks.getRankOfPlayer(member);
    var fields = [];
    for (var i = 0; i < ranks.length; i++) {
        var rank = Ranks.getRank(role.id, ranks[i].name);
        fields.push({
            title: (ranks[i].smiley ? ranks[i].smiley + ' ' : '') + ranks[i].name,
            text: ranks[i].points + ' points',
            grid: true
        });
    }
    var globalPlayer = Players.getPlayers()[member.id];
    if (globalPlayer) {
        var btag = Players.getBtag(globalPlayer.id);
        var psn = Players.getPsn(globalPlayer.id);
        var psncomprank = Players.getPsnComprank(globalPlayer.id);
        var comprank = Players.getComprank(globalPlayer.id);
    }
    Utils.sendEmbed(message, role.color, (member.nickname ? member.nickname : member.user.username),
        `**Clan:** ${role.name}
**Total de points:** ${!player ? 0 : player.points ? player.points : 0}` + (!btag ? '' : `
**Battle tag:** ${btag}`) + (!psn ? '' : `
**PSN:** ${psn}`) + (!comprank ? '' : `
**cote:** ${comprank}`) + (!psncomprank ? '' : `
**cote PSN:** ${psncomprank}`)
        , message.author, fields, clan.image);
    return;
}
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Donne plus d\'info sur une personne ou un clan.',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande rang", "", message.author, [{
            title: Constants.prefix + 'info [clan|@membre]',
            text: "Donne plus d\'info sur une personne ou un clan.",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var role = Clans.getRoleByName(args.join(' '), message.channel.guild);
        var member = message.mentions.members.first();
        if (!role && !member) {
            var member = message.member;
        }
        if (member) {
            displayRoleOfMember(message, member);
            return;
        }
        displayRoleOfClan(message, role);
    }
}