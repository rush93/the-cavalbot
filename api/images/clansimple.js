const Clans = require('../../models/clans');
const Players = require('../../models/players');
const Utils = require('../../utils');
var Jimp = require("jimp");
var fs = require('fs');

var guild;
module.exports = {
    route: '/images/clan',
    method: 'get',
    init: (discordGuild) => {
        guild = discordGuild;
    },
    exec: (req, res) => {
        var clan = Clans.getRole(req.query.c, guild);
        if (!clan) {
            res.render('index', { message: 'Le clan est incorrect' });
            return;
        }
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (fs.existsSync(`${__dirname}/../../img/${clan.id}.png`)) {
            Utils.log(Utils.Color.FgMagenta + ip + Utils.Color.Reset + `: Image requested ${Utils.Color.FgGreen}load from cache.`);
            var path = require(`path`);
            res.sendFile(path.resolve(`${__dirname}/../../img/${clan.id}.png`));
            return;
        }
    }
};