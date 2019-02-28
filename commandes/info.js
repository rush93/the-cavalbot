const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
var moment = require('moment');

var displayRoleOfClan = function (message, role) {
    var ranks = Ranks.getSortedKeys(role.id);
    var clan = Clans.getClan(role);
    var totalPoints = Utils.getScoreOfClan(clan.id, Clans);
    var fields = [
        {
            title: "Nombre de personnes",
            text: role.members.array().length,
            grid: true
        }, {
            title: "Points de la saison",
            text: totalPoints,
            grid: true
        }, {
            title: "Total de points",
            text: totalPoints + Clans.getPointsOfLastSeason(clan.id),
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
    var image = Constants.domain + '/images/clan?c=' + clan.id + '&s=' + totalPoints;
    Utils.sendEmbed(message, role.color, "Clan " + role.name, clan.description ? clan.description : '', message.author, fields, image);
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
        Utils.reply(message, 'Cette personne n\'a pas de clan !');
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
        var btagString = null;
        var btagObjects = Players.getBtags(globalPlayer.id);
        if (btagObjects) {
            btagString = [];
            var btags = Object.keys(btagObjects);
            for (var i = 0; i < btags.length; i++) {
                var str = btags[i];
                if (btagObjects[btags[i]].comprank ) {
                    str += ' (' + btagObjects[btags[i]].comprank + ')';
                }
                btagString.push(str);
            }
        }

        var psnString = null;
        var psnObjects = Players.getPsns(globalPlayer.id);
        if (psnObjects) {
            psnString = [];
            var psns = Object.keys(psnObjects);
            for (var i = 0; i < psns.length; i++) {
                var str = psns[i];
                if (psnObjects[psns[i]].psncomprank ) {
                    str += ' (' + psnObjects[psns[i]].psncomprank + ')';
                }
                psnString.push(str);
            }
        }
    }
    var seasonPoints = null;
    if ( Constants.season && Constants.season !== 0 && player && player.points) {
        seasonPoints = player.points;
    }
    var totalPoints = Players.getPointsOfAllTimes(member.id, clan.id);
    var image = Constants.domain + '/images/clansimple?c=' + clan.id;
    var dif = globalPlayer && globalPlayer.lastUpdate ? moment.duration(moment().diff(globalPlayer.lastUpdate)).locale("fr").humanize() : null;
    var lastJoin = globalPlayer ? globalPlayer.cooldown : null;
    lastJoin = moment(lastJoin);
    var now = moment();
    diff = Math.abs(now.diff(lastJoin, 'minutes'));
    moment.locale('fr');

    
    // if(moment.duration(diff, 'minutes').humanize() == "quelques secondes"){
    //     var roles = Utils.getRolesOfPerm(message.guild, 'KICK_MEMBERS');
    //     var str = [];
    //     for (var i = 0; i < roles.length; i++) {
    //         str.push(`<@&${roles[i].id}>`);
    //     }
    //     message.channel.send(str.join(', '));
    //     message.channel.send('<@!'+member.id+'> envoi un mp a au personne si dessus avec ta date d\'arriver dans ton clan ou attend 2 minutes si tu viens juste d\'arriver dans ton clan');
    // }else{
        Utils.sendEmbed(message, role.color, (member.nickname ? member.nickname : member.user.username),
        `**Clan:** ${role.name}` + `
**Dans le clan depuis**: ` + moment.duration(diff, 'minutes').humanize() + (seasonPoints === null ? '' : `
**Points de la saison:** ${seasonPoints}`) + `
**Total de points:** ${!player ? 0 : totalPoints ? totalPoints : 0}` + (!btagString || btagString.length <= 0 ? '' : `
**Battle tag:** ${btagString.join(', ')}`) + (!psnString || psnString.length <= 0  ? '' : `
**PSN:** ${psnString.join(', ')}`) + (!dif  ? '' : `
**Dernière mise à jour:** ${dif}`) + ` ${globalPlayer && globalPlayer.epou ? `
:ring: <@!${globalPlayer.epou}>` : ''} `
        , message.author, fields, image);
    Players.updateComprank(member.id);
    // }
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
