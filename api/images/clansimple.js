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
        Utils.log(Utils.Color.FgMagenta + ip + Utils.Color.Reset + `: test ${Utils.Color.FgGreen}load from cache.`);
        if (fs.existsSync(`${__dirname}/../../img/${clan.id}.png`)) {
            var path = require(`path`);
            res.sendFile(path.resolve(`${__dirname}/../../img/${clan.id}.png`));
            return;
        }
    }
};