const Discord = require('discord.js');
var moment = require('moment');
const Utils = require('../utils');
var Constants = require('../models/constants');
var players = require('../models/players');
var clans = require('../models/clans');

function myFunc(guild,player) {

    let AuCachotRole = guild.roles.find("name", "Au cachot");

    player.removeRole(AuCachotRole, "punition fini");
}

module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet de tester des commandes',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande test", "", message.author, [{
            title: Constants.prefix + 'test',
            text: "tester des trucs",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "SEUL LES GRANDS DE CE MONDE PEUVENT TOUCHER A çA", true);
            return;
        }
        var array = args.join(" ").split(" ");
    	//message.channel.send("array[0] "+array[0]); //joueur
        //message.channel.send("array[1] "+array[1]); //temps
        //message.channel.send("array[2] "+array[2]); //reason

        let AuCachotRole = message.guild.roles.find("name", "Au cachot");

        message.mentions.members.first().addRole(AuCachotRole, array[2]);

        setTimeout(function(){
            myFunc(message.guild ,message.mentions.members.first());
        },parseInt(array[1])*1000*60*60);
    }
}