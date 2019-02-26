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
        var score = Utils.getScoreOfClan(clan.id, Clans) + '';
        if (fs.existsSync(`${__dirname}/../../img/generated/${clan.id}_${score}.png`)) {
            Utils.log(Utils.Color.FgMagenta + ip + Utils.Color.Reset + `: Image requested ${Utils.Color.FgGreen}load from cache.`);
            var path = require(`path`);
            res.sendFile(path.resolve(`${__dirname}/../../img/generated/${clan.id}_${score}.png`));
            return;
        }
        Utils.log(Utils.Color.FgMagenta + ip + Utils.Color.Reset + `Image requested ${Utils.Color.FgYellow}generate new one.`);
        Jimp.read(`${__dirname}/../../img/${clan.id}.png`).then(function (image) {
            Jimp.loadFont(`${__dirname}/../../fonts/font.fnt`).then(function (font) {
                image
                    .resize(300, 300)
                    .print(font, 150 - ((score.length * 27) / 2), 225, score)
                    .write(`${__dirname}/../../img/generated/${clan.id}_${score}.png`)
                    .getBuffer(Jimp.MIME_PNG, function(err, buffer){
                    res.set("Content-Type", Jimp.MIME_PNG);
                        res.send(buffer);
                    });
            }).catch((err) => {
                Utils.log(err, true);
            });
        }).catch(function (err) {
            Utils.log(err, true);
        });
    }
};