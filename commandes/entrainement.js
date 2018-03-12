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

        /**
         * Exercie 1 
         * quand tu fait '_train' le bot dois répondre 'salut comment ça va' dans un embed
         */

        /**
         * Exercice 2
         * quand tu fait '_train bonjour' le bot répond 'bonjour'
         * quand tu fait '_train ça va ?' le bot répond 'oui et toi ?'
         */

        /**
         * Exercice 3 
         * quand tu fait '_train @personne' afficher le nombre de points du joueur
         */

        /**
         * Exercice 4
         * créer une autre commande '_bonjour' qui la liste des events
         */

        /**
         * Exercice 5
         * coder une vrais fonctionnalitée (demander a rush) xD
         */

    }
}