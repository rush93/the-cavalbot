const Clans = require('../../models/clans');
const Players = require('../../models/players');
const Utils = require('../../utils');
var fs = require('fs');

var guild;
module.exports = {
    route: '/images/clansimple',
    method: 'get',
    init: (discordGuild) => {
        guild = discordGuild;
    },
    exec: (req, res) => {
        Utils.log('slt');
        var clan = Clans.getRole(req.query.c, guild);
        if (!clan) {
            res.render('index', { message: 'Le clan est incorrect' });
            return;
        }
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        //window.location.href = 'telnet://90.104.213.167/:25'
        //ecouter le port 25 de l'autre coté pour récup l'ip
        if (fs.existsSync(`${__dirname}/../../img/base/${clan.id}.png`)) {
            Utils.log(Utils.Color.FgMagenta + ip + Utils.Color.Reset + `: Image requested ${Utils.Color.FgGreen}load from cache.`);
            var path = require(`path`);
            res.sendFile(path.resolve(`${__dirname}/../../img/base/${clan.id}.png`));
            return;
        }
    }
};