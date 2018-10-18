/*diff = facile/moyen/diff/impossible
_mission    information //affiche mission en cours ou propose commande demandeMission
            create arg
            demandeMission  diff
            demandeMissionEvent diff
            demandeMissionEventGroupe diff
            demandeMissionGroupe diff
            modifierEtat false/true "nom mission"
            list //afficher nbr mission global/ ou arg diff
            history soi meme ou @personne
            vérification lienimage
            points*/
const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
//var Clans = require('../models/clans');
var Players = require('../models/players');
var commands = {
    create: {
        help: [
            'Permet de créer une mission.'
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, 'La mission a bien été crée.')
        }
    },
    information: {
        help: [
            'Permet de voir les informations sur la mission en cours'
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, 'info');
        }
    },
    demandeMission: {
        help: [
            ''
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, '');
        }
    },
    demandeMissionEvent: {
        help: [
            ''
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, '');
        }
    },
    demandeMissionGroupe: {
        help: [
            ''
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, '');
        }
    },
    demandeMissionEventGroupe: {
        help: [
            ''
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, '');
        }
    },
    modifierEtat: {
        help: [
            ''
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, '');
        }
    },
    list: {
        help: [
            ''
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, '');
        }
    },
    history: {
        help: [
            ''
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, '');
        }
    },
    verification: {
        help: [
            ''
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, '');
        }
    },
    points: {
        help: [
            ''
        ],
        args: '',
        runCommand: (clan, args, message) => {
            
            Utils.reply(message, '');
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
        if (args.length < 2) {
            help(message);
            return;
        }
        var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
        args = reg[2].trim().split(' ');
        var name = reg[1].replace(/"/g, '');
        var role = Clans.getRoleByName(name, message.channel.guild);
        if (!role) {
            Utils.reply(message, "Aucun rôle avec ce nom", true);
            return;
        }
        if (commands[args[0]]) {
            var label = args[0];
            args.shift();
            commands[label].runCommand(role, args, message);
        } else {
            help(message);
        }
    }
}