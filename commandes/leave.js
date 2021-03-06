
const Discord = require('discord.js');
var moment = require('moment');
const Utils = require('../utils');
var Clans = require('../models/clans');
var Players = require('../models/players');
var Constants = require('../models/constants');
module.exports = {
    role: Constants.leaveCooldown < 0 ? 'MANAGE_GUILD' : 'SEND_MESSAGES',
    helpCat: 'Permet de quitter un clan',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande leave", "", message.author, [{
            title: Constants.prefix + 'leave',
            text: "Permet de quitter un clan",
            grid: false
        }]);
    },
    runCommand: (args, message) => {

        if (Constants.leavemessage < 0) {
            Utils.reply(message, "Vous ne pouvez pas quitter de clan.", true);
            return;
        }
        var clan = Clans.getPlayerClan(message.member);
        if (!clan) {
            Utils.reply(message, "Vous n'êtes pas dans un clan.", true);
            return;
        }
        if (Constants.leaveCooldown === -1 ) {
            Utils.reply(message, "Vous ne pouvez pas quitter de clan.", true);
            return;
        }
        var lastJoin = Players.getPlayers()[message.member.id] ? Players.getPlayers()[message.member.id].cooldown : null;
        if (lastJoin) {
            lastJoin = moment(lastJoin);
            var now = moment();
            diff = Math.abs(now.diff(lastJoin, 'minutes'));
            if (diff < Constants.leaveCooldown) {
                var timeLeft = Constants.leaveCooldown - diff;
                moment.locale('fr');
                Utils.reply(message, 'Vous ne pouvez pas changer de clan pour le moment, vous devez encore attendre ' + moment.duration(timeLeft, 'minutes').humanize());
                return;
            }
        }
        if (Constants.resetRankWhenChangeClan) {
            Players.setPoints(message.member.id, clan.id, 0);
        }
        Players.resetRank(message.member, clan);
        let clanRole = Clans.getRole(clan.id, message.guild);
        Clans.removePlayer(clanRole, message.member, "quitter le clan avec la commande leave", Object.keys(Players.getPsns(message.member.id)).length > 0);
        message.member.removeRole(message.guild.roles.get(Clans.getFaction(clanRole)), 'Leave faction');
        Utils.reply(message, "Vous avez bien quitté le clan.");
    }
}