/*diff = facile/moyen/diff/impossible
_mission    information //affiche mission en cours ou propose commande demandeMission
            demandeMission  diff
            demandeMissionEvent diff
            demandeMissionEventGroupe diff
            demandeMissionGroupe diff
            modifierEtat false/true "nom mission"
            history soi meme ou @personne
            vérification lienimage
*/
const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Mission = require('../models/mission');
var Players = require('../models/players');
var commands = {
    create: {
        help: [
            'Permet de créer une mission.'
        ],
        args: '',
        runCommand: (args, message) => {
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var desc = reg[1].replace(/"/g, '');
            if (args.length < 3) {
                Utils.reply(message, 'Il manque des arguments. (desc, difficulte, mode, hero, event (si il y a))');
                return;
            }
            if (args[4]) {
                Mission.createMission(desc, args[0],args[1],args[2],args[3],args[4]);
            }else{
                Mission.createMission(desc, args[0],args[1],args[2],args[3]);
            }
            Utils.reply(message, 'La mission a bien été crée.')
        }
    },
    information: {
        help: [
            'Permet de voir les informations sur la mission en cours'
        ],
        args: '',
        runCommand: (args, message) => {
            Utils.reply(message, '');
        }
    },
    demandeMission: {
        help: [
            'permet de demander une mission'
        ],
        args: '',
        runCommand: (args, message) => {
            
            Utils.reply(message, '');
        }
    },
    demandeMissionEvent: {
        help: [
            'permet de demander une mission en rapport avec l\'event en cours'
        ],
        args: '',
        runCommand: (args, message) => {
            
            Utils.reply(message, '');
        }
    },
    demandeMissionGroupe: {
        help: [
            'demander des missions à réaliser en groupe, plus dur mais plus de points'
        ],
        args: '',
        runCommand: (args, message) => {
            
            Utils.reply(message, '');
        }
    },
    demandeMissionEventGroupe: {
        help: [
            'mission de groupe et d\'event'
        ],
        args: '',
        runCommand: (args, message) => {
            
            Utils.reply(message, '');
        }
    },
    modifierEtat: {
        help: [
            'activer(true) ou dé-activer(false) un mission'
        ],
        args: 'true/false',
        runCommand: (args, message) => {
            
            Utils.reply(message, '');
        }
    },
    list: {
        help: [
            'affiche la list des missions'
        ],
        args: '',
        runCommand: (args, message) => {
            var listMissions = Mission.getMissions();
            var keys = Object.keys(listMissions);
            var fields = [];
            var fieldsTry = [];
            var difficulte = [];

            for (var i = 0; i < keys.length; i++) {
                if (listMissions[i].event==null) {
                    if (difficulte[listMissions[i].difficulte]==null) {
                        difficulte[listMissions[i].difficulte] = 1;
                    }else{
                        difficulte[listMissions[i].difficulte]++;
                    }
                }else{
                    if (difficulte[listMissions[i].event]==null) {
                        difficulte[listMissions[i].event] = 1;
                    }else{
                        difficulte[listMissions[i].event]++;
                    }
                    
                }
                
            }
            var keysDiff = Object.keys(difficulte);
            for (var i = 0; i < keysDiff.length; i++) {
                fields.push({
                    title: keysDiff[i],
                    text: difficulte[keysDiff[i]],
                    grid: false
                });
            }
            if (args < 1) {
                Utils.sendEmbed(message, 0xE8C408, "Missions par type", "", message.author, fields);
            }else{
                for (var i = 0; i < keys.length; i++) {
                    if (listMissions[keys[i]].difficulte == args[0] || listMissions[keys[i]].event == args[0]) {
                        fieldsTry.push({
                            title: i,
                            text: listMissions[keys[i]].nom,
                            grid: false
                        });
                    }  
                }
                if (Object.keys(fieldsTry).length == 0) {
                    Utils.reply(message, 'Pas de mission pour cette catégorie');
                }else{
                    Utils.sendEmbed(message, 0xE8C408, "Missions "+args[0], "", message.author, fieldsTry);
                }
            }
            
        }
    },
    history: {
        help: [
            'affiche l\'history des missions d\'un joueur'
        ],
        args: '',
        runCommand: (args, message) => {
            
            Utils.reply(message, '');
        }
    },
    verification: {
        help: [
            'valider une mission'
        ],
        args: '',
        runCommand: (args, message) => {
            
            Utils.reply(message, '');
        }
    },
    points: {
        help: [
            'afficher le tableau des récompense'
        ],
        args: '',
        runCommand: (args, message) => {
            var embed = new Discord.RichEmbed({});
            embed.setColor(0x00AFFF);
            embed.setImage("https://cdn.discordapp.com/attachments/429572880045572096/502588044902400010/unknown.png");
            return message.channel.send("", embed);
        }
    }
}
var help = function (message) {
    var keys = Object.keys(commands);
    var fields = [];
    keys.forEach((command, index) => {
        fields.push({
            text: commands[command].help,
            title: `${Constants.prefix}mission ${command} ${commands[command].args}`,
            grid: false
        });
    });
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes des missions', "", message.author, fields);
}
module.exports = {
    role: 'CHANGE_NICKNAME',
    helpCat: 'Permet d\'obtenir une mission',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("CHANGE_NICKNAME")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour jouer avec les missions (pas encore)", true);
            return;
        }
        if (commands[args[0]]) {
            var label = args[0];
            args.shift();
            commands[label].runCommand(args, message);
        } else {
            help(message);
        }
    }
}