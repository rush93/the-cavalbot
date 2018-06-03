const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var moment = require('moment');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de s\'ajouter un role',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande role", "", message.author, [{
            title: Constants.prefix + 'role <@role>',
            text: "Permet de rejoindre un role (Healer/DPS/Tank/Off-Tank)",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var nomRole = args.join(' ');
        var role = ["Healer","DPS","Tank","Off-Tank"];
        if (role.indexOf(nomRole) == -1 || message.guild.roles.find('name', nomRole) == null) {
            Utils.reply(message, "Aucun role avec ce nom :O", true);
            return;
        }else if(message.member.roles.find('name', nomRole)) {
        	message.member.removeRole(message.guild.roles.find('name', nomRole));
            Utils.reply(message, "Suppression du role réussi.", true);
            return;
        }else{
            message.member.addRole(message.guild.roles.find('name', nomRole));
            Utils.reply(message, "Profite bien de ton nouveau role O^O.", true);
            return;
        }
    }
}