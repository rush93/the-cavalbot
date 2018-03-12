const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Ton premier entrainement ici',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande train", "", message.author, [{
            title: Constants.prefix + 'train aucune idée lol',
            text: "Ton premier entrainement ici",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        console.log('ICI TON CODE');
    }
}