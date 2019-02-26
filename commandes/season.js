const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Clans = require('../models/clans');
var Players = require('../models/players');
var commands = {
    next: {
        help: [
            'Permet de passer à la nouvelle saison.'
        ],
        args: '',
        runCommand: (args, message) => {
            var season = Constants.season + 1;
            var players = Players.getPlayers();
            var PlayerKeys = Object.keys(players);
            for (var i = 0; i < PlayerKeys.length; i++) {
                var objectKeys = Object.keys(players[PlayerKeys[i]].clans);
                for (var j = 0; j < objectKeys.length; j++) {
                    if (typeof(players[PlayerKeys[i]].clans[objectKeys[j]]) === "object") {
                        if (players[PlayerKeys[i]].clans[objectKeys[j]]) {
                            Players.setSeasonPoints(PlayerKeys[i], objectKeys[j], season, true);
                            Players.setPoints(PlayerKeys[i], objectKeys[j], 0, false);
                        }
                    }
                }
            }
            Players.save();
            var clansIds = Object.keys(Clans.getAllClan())
            for (var i = 0; i < clansIds.length; i++) {
                let points = Clans.getClanById(clansIds[i]).points;
                Clans.setSeasonPoints(clansIds[i], points, season, true);
                Clans.delPoints(clansIds[i], points);
            }
            Clans.save();
            Utils.reply(message, 'Une nouvelle saison a été créée.');
            Constants.season = season;
        }
    },
    rollback: {
        help: [
            'Permet de supprimer le changement de saison.'
        ],
        args: '',
        runCommand: (args, message) => {
            if (Constants.season <= 0) {
                Utils.reply(message, 'Aucune saison a rollback.', true);
                return;
            }
            Constants.season = Constants.season - 1;
            Utils.reply(message, 'Le rollback a bien été pris en compte. (ou pas lol #flem de recoder ça)');
        }
    },
}
var help = function (message) {
    var keys = Object.keys(commands);
    var fields = [];
    keys.forEach((command, index) => {
        fields.push({
            text: commands[command].help,
            title: `${Constants.prefix}season ${command} ${commands[command].args}`,
            grid: false
        });
    });
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes des saisons', "", message.author, fields);
}
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet d\'administrer les saisons',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour toucher aux saisons", true);
            return;
        }
        if (args.length < 1) {
            help(message);
            return;
        }
        
        if (commands[args[0]]) {
            var label = args[0];
            args.shift();
            commands[label].runCommand(args, message);
        } else {
            help(message);
        }
    }
}