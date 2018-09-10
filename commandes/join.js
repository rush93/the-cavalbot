const Discord = require('discord.js');
const Utils = require('../utils');
var Clans = require('../models/clans');
var Players = require('../models/players');
var Constants = require('../models/constants');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de rejoindre un clan',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande join", "", message.author, [{
            title: Constants.prefix + 'join <@clan>',
            text: "Permet de rejoindre un clan",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var nomClan = args.join(' ');
        var role = Clans.getRoleByName(nomClan.charAt(0).toUpperCase() + nomClan.slice(1), message.channel.guild);
        if (!role) {
            Utils.reply(message, "Aucun rôle avec ce nom", true);
            return;
        }
        var clan = Clans.getClan(role);
        if (!clan) {
            Utils.reply(message, "Aucun clan pour ce rôle.", true);
            return;
        }
        if (Clans.getJoin(role) == false) {
            Utils.reply(message, "Désolé ce clan est fermé", true);
            return;
        }
        clan = Clans.addPlayer(role, message.member, "rejoins le clan avec la commande join", Object.keys(Players.getPsns(message.member.id)).length > 0);
        if (!clan) {
            Utils.reply(message, "Vous êtes déjà dans un clan.", true);
            return;
        }
        let factionId = Clans.getFaction(role);
        if (factionId == false) {// (exemple) es ce que la faction united nation est lié a ow ?
            //pas de faction lié, il ne se passe rien
            Utils.reply(message, 'Aucune facction lié a ce clan', true);
            return;
        }else{
            var faction = message.guild.roles.get(factionId);
            message.member.addRole(faction, "faction automatique");
        }
        Players.setCooldown(message.member);
        Utils.reply(message, "Vous avez bien rejoins le clan " + role.name);
    }
}