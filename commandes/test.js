const Discord = require('discord.js');
var moment = require('moment');
const Utils = require('../utils');
var Constants = require('../models/constants');
var players = require('../models/players');
var clans = require('../models/clans');

module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet de tester des commande',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande test", "", message.author, [{
            title: Constants.prefix + 'test',
            text: "tester des trucs",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var clanId = clans.getPlayerClan(message.member).id;
        var clan = clans.getPlayerClan(message.member);
        var player = players.getPlayer(message.member.id, clanId);
        players.resetRank(message.member, clan);
        players.setPoints(message.member.id, clanId, 0);
    }
}