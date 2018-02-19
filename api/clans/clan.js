const Clans = require('../../models/clans');
const Players = require('../../models/players');
var guild;
module.exports = {
    route: '/clan',
    method: 'get',
    init: (discordGuild) => {
        guild = discordGuild;
    },
    exec:  (req, res) => {
        var userId = req.query.u;
        var clanId = req.query.c;
        if (!userId || !clanId) {
            res.redirect('/');
            return;
        }
        var member = guild.members.get(userId);
        if (!member) {
            res.render('error', { message: 'AIE! une erreur est survenu... vous n\‘avez pas été trouvé en temps que membre' });
            return;
        }
        member.sendMessage("Une demande pour rejoindre le clan " + Clans.getRole(clanId, guild).name + " a été faite, veuillez entrer le code de sécurité. Si cette demande n'as pas été faite par vous merci d'ignorer ce message.");
        var tempCode = Math.floor((Math.random() * 100000) + 1000);
        Players.setTempClanToJoin(userId, clanId, tempCode);
        res.render('confirmCode', { code: tempCode });
    }
};