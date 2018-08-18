const Discord = require('discord.js');
var moment = require('moment');
const Utils = require('../utils');
var Constants = require('../models/constants');

function myFunc(guild,player) {

    let AuCachotRole = guild.roles.find("name", "Au cachot");

    player.removeRole(AuCachotRole, "punition fini");
}

module.exports = {
    role: 'CHANGE_NICKNAME',
    helpCat: 'Permet d\'exiler les mechants',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande exil :", "", message.author, [{
            title: Constants.prefix + 'exil @aejii 1 il_a_pas_ete_gentil',
            text: "@lapersonne, le temps en heure, la reason tout attaché",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (!message.member.hasPermission("CHANGE_NICKNAME")) {
            Utils.reply(message, "Réessaie encore une fois et c'est toi que j'exil", true);
            return;
        }
        var array = args.join(" ").split(" ");
    	//array[0] //joueur
        //array[1] //temps
        //array[2] //reason

        let AuCachotRole = message.guild.roles.find("name", "Au cachot");

        message.mentions.members.first().addRole(AuCachotRole, array[2]);

        setTimeout(function(){
            myFunc(message.guild ,message.mentions.members.first());
        },parseInt(array[1])*1000*60*60);
    }
}