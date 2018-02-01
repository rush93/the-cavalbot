const Discord = require('discord.js');
const Utils = require('../utils');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet d\'afficher plus d\'information sur un clan',
    help: function(message) {
        Utils.sendEmbed(message, 0x00AFFF,"Utilisation de la commande info", "", message.author, [{
            title: Constants.prefix + 'info <@clan>',
            text: "Permet d\'afficher plus d\'information sur un clan",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var role = message.mentions.roles.first();
        if (!role) {
            Utils.reply(message, "Vous devez mensionnez un role", true);
            return;
        }
        var clan = Clans.getClan(role);
        if (!clan) {
            Utils.reply(message, "Aucuns clan pour ce role.", true);
            return;
        }

        embed = new Discord.RichEmbed({});
        embed.setColor(role.color);
        embed.setTitle("Clan: " + role.name);
        if (clan.description) {
            embed.setDescription(clan.description);
        }
        if (clan.image) {
            embed.setThumbnail(clan.image);
        }
        embed.addField("Nombre de personnes", role.members.array().length, true);
        embed.setFooter(message.author.username + "#" + message.author.discriminator, message.author.avatarURL);
        message.channel.send("", embed);
    }
}