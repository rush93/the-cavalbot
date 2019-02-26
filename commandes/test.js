const Discord = require('discord.js');
var moment = require('moment');
const Utils = require('../utils');
var Constants = require('../models/constants');
var players = require('../models/players');
var clans = require('../models/clans');


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
            Utils.reply(message, "SEUL LES GRANDS DE CE MONDE PEUVENT TOUCHER A çA mais faut eviter", true);
            return;
        }
        Utils.sendDM(message.author,"Bienvenue sur OwAssembly, le serveur qui reproduit l'ambiance du jeu à travers son système de clans et ses multiples évènements!"
+"\nCe serveur n'a pas de vocation compétitive ou professionnelle. Si c'est ton but, nous t'invitons à aller visiter le discord de notre partenaire OverTown."

+"\n\nAvant toute chose:"
+"\nPrends connaissance des quelques règles du serveur, elles se trouvent dans  #📋règlements ."
+"\nChoisis ton clan parmi les 9 que le serveur propose et participe avec les autres membres à la course aux points!"
+"\nL'histoire des différents clans se trouve sur notre site internet (http://overwatch-assemble.fr/)."
+"\nLe clan Shambali est celui qu'il te faut si tu souhaites être simple observateur et ne participer à aucun évènement."

+"\n\nLe bot Athena est à ta disposition à tout moment et peut te fournir un grand nombre d'informations."
+"\nPour interagir avec lui, rends toi dans #bot-en-kaou-tchou ."
+"\nLes deux premières commandes qui t'intéresseront sont le _help (liste des commandes du bot) et le _btag pour renseigner ton identifiant Battle.net et ainsi pouvoir participer aux divers évènements.Tu trouveras sur notre serveur plusieurs types d'évènements auquel tu peux facilement participer, et notamment :"
+"\n:small_orange_diamond: Des mini-jeux de toutes sortes : le planning des mini-jeux se trouve dans #annonces-mini-jeux (épinglé). Pour participer, il te suffit de te rendre dans #bot-en-kaou-tchou et de taper la commande _participe"
+"\n:small_orange_diamond: Des guerres de clan : les clans s'affrontent pendant une saison de 2 mois pour défendre leurs orbes et s'emparer de celle des autres clans! Les règles de cet affrontement se trouvent sur le site dans l'onglet GDC.small_orange_diamond: Des tournois : Une fois par mois, un grand tournoi vise à départager la meilleure équipe! Celle-ci remporte un grade \"Vainqueurs du tournoi\" durant le mois suivant. Les règles de cet évènement sont postées avant chaque nouveau tournoi dans #tournois-gdc .");

        message.guild.channels.get("483319784163770388").send(`Bienvenue à toi ${message.member}! 
Choisis ton clan parmi la liste si dessous :`);
        message.channel.guild.fetchMember(message.author.id).then(member => {
              message.member = member
              runCommand("list", message);
              message.guild.channels.get("483319784163770388").send(`Si tu as des questions ou si tu souhaites une présentation plus poussée du serveur, n'hésite pas à contacter un modérateur ou un membre du staff. Nous te souhaitons encore une fois la bienvenue et nous espérons que tu tu te plairas sur notre serveur!
L'équipe d'OA` );
            }).catch((e) => {
              Utils.log(e.stack, true);
            });
            
  }
}