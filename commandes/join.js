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
        var role = Clans.getRoleByName(args.join(' '), message.channel.guild);
        if (!role) {
            Utils.reply(message, "Aucuns role avec ce nom", true);
            return;
        }
        var clan = Clans.getClan(role);
        if (!clan) {
            Utils.reply(message, "Aucuns clan pour ce role.", true);
            return;
        }
        if (!message.member) {
            message.channel.send("<@270268597874589696>...")
            Utils.reply(message, `Alors alors comment dire... enfait c'est un bug chelou que j'ai pas encore compris... du coup ça a pas marché donc tu as 3 choix:
 - tu appel un admin/ gestionaire
 - tu refait la commande (ça peu marcher par chance)
 - tu dis a rush qu'il sais pas coder
ou alors tu fait les 3.`, true);
            return;
        }
        clan = Clans.addPlayer(role, message.member, "rejoins le clan avec la commande join", Object.keys(Players.getPsns(message.member.id)).length > 0);
        if (!clan) {
            Utils.reply(message, "Vous êtes déjà dans un clan.", true);
            return;
        }
        Players.setCooldown(message.member);
        Utils.reply(message, "Vous avez bien rejoins le clan " + role.name);
    }
}