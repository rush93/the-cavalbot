const Discord = require('discord.js');
var moment = require('moment');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Players = require('../models/players');

function myFunc(guild,player) {

    let AuCachotRole = guild.roles.find("name", "Au cachot");

    player.removeRole(AuCachotRole, "punition fini");
}

module.exports = {
    role: 'KICK_MEMBERS',
    helpCat: 'Permet d\'exiler les mechants',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande exil :", "", message.author, [{
            title: Constants.prefix + 'exil @aejii 1 il_a_pas_ete_gentil',
            text: "@lapersonne, le temps en heure, la reason tout attaché",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        let AuCachotRole = message.guild.roles.find("name", "Au cachot");
        var channel = message.guild.channels.get("443498746144227358");//ajouter constante
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            Players.setTestExil(message.member);
            if (Players.getTestExil(message.member)>=2) {
                message.member.addRole(AuCachotRole, "Utilisation commande exil par la pleb");
                Utils.reply(message, "Aller au cachot", false);
                channel.send(` ${message.member} Tu as été exiler `+parseInt(Players.getTestExil(message.member))+" heure(s) . La raison : Utilisation de la commande exil par la pleb.");
                setTimeout(function(){
                    myFunc(message.guild ,message.member);
                },parseInt(Players.getTestExil(message.member))*1000*60*60);
            }else{
                Utils.reply(message, "Réessaie encore une fois et c'est toi que j'exil", true);
            }
            return;
        }
        var array = args.join(" ").split(" ");
    	//array[0] //joueur
        //array[1] //temps
        //array[2] //reason
        message.mentions.members.first().addRole(AuCachotRole, array[2]);
        Utils.reply(message, "Exil réussi", false);

        channel.send(` ${message.mentions.members.first()} Tu as été exiler `+parseInt(array[1])+` heure(s) . La raison : `+array[2]+ ".");

        setTimeout(function(){
            myFunc(message.guild ,message.mentions.members.first());
        },parseInt(array[1])*1000*60*60);
    }
}