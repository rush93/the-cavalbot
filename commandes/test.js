const Discord = require('discord.js');
var moment = require('moment');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');
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
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "ptdr t ki ?", true);
            return;
        }
        var lastJoin = Players.getPlayers()[message.member.id] ? Players.getPlayers()[message.member.id].cooldown : null;
        if (lastJoin) {
            lastJoin = moment(lastJoin);
            var now = moment();
            diff = Math.abs(now.diff(lastJoin, 'minutes'));
            moment.locale('fr');

            Utils.reply(message, `Dans le clan depuis :  `+ moment.duration(diff, 'minutes').humanize());
        }
        
    }
}