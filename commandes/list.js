const Utils = require('../utils');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet d\'afficher la liste des clans',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande list", "", message.author, [{
            title: Constants.prefix + 'list',
            text: "Permet d\'afficher la liste des clans",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var fields = [];
        var keys = Object.keys(Clans.clans);
        for (var i = 0; i < keys.length; i++) {
            var guildRole = message.guild.roles.get(keys[i])
            var clan = Clans.getClan(guildRole);
            fields.push({
                title: guildRole.name,
                text: `**Nombre de joueurs:** ${guildRole.members.array().length}
**Score du clan:** ${clan.points ? clan.points : 0}
${clan.description ? clan.description : ''}`,
                grid: true
            });
        }
        Utils.sendEmbed(message, 0xE8C408, "Liste des clans", "", message.author, fields);
    }
}