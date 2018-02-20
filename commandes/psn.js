const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de changer son psn.',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande psn", "", message.author, [{
            title: Constants.prefix + 'psn <psn>',
            text: "Permet de changer son psn.",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (args.length < 1) {
            Utils.reply(message, 'Vous devez mettre un psn', true);
            return;
        }

        var psns = Players.getPsns(message.member.id)
        if(psns && psns[args.join(' ')]) {
            Players.setPsn(message.member.id, args.join(' '));
            Utils.reply(message, 'Votre PSN a bien été supprimé.');
            if ( Object.keys(Players.getPsns(message.member.id)).length === 0) {
                var clan = Clans.getPlayerClan(message.member);
                var player = clan ? Players.getPlayer(message.member.id, clan.id): null;
                var rank =  player ? player.activeRank: null;
                var nickname = Utils.replaceModifier(
                    Constants.pseudoModifier,
                    clan,
                    message.member,
                    player,
                    rank,
                    false,
                    Constants.PS4,
                    false
                );
                if (nickname.length > 32) {
                    nickname = nickname.substr(0, 32);
                }
                message.member.setNickname(nickname).then(() => {
                    Utils.reply(message, 'Votre PSN a été mis à jour.');
                }).catch(() => {
                    Utils.reply(message, 'Bah ton PSN a été mis à jour mais comme tu te sens au dessus des gens je peux pas changer ton pseudo.');
                });
                return;
            }
            return;
        }
        Players.setPsn(message.member.id, args.join(' ')).then(() => {
            if ( Object.keys(Players.getPsns(message.member.id)).length === 1) {
                var clan = Clans.getPlayerClan(message.member);
                var player = clan ? Players.getPlayer(message.member.id, clan.id): null;
                var rank =  player ? player.activeRank: null;
                var nickname = Utils.replaceModifier(
                    Constants.pseudoModifier,
                    clan,
                    message.member,
                    player,
                    rank,
                    true,
                    Constants.PS4,
                    false
                );
                if (nickname.length > 32) {
                    nickname = nickname.substr(0, 32);
                }
                message.member.setNickname(nickname).then(() => {
                    Utils.reply(message, 'Votre PSN a été mis à jour.');
                }).catch(() => {
                    Utils.reply(message, 'Bah ton PSN a été mis à jour mais comme tu te sens au dessus des gens je peux pas changer ton pseudo.');
                });
                return;
            }
            Utils.reply(message, 'Votre PSN a été mis à jour.');
        }).catch((e) => {
            Utils.log(e, true);
            Utils.reply(message, 'Votre PSN est introuvable.');
        });
        Utils.reply(message, 'Recherche sur le Playstation network...');
    }
}