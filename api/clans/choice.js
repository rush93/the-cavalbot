const Clans = require('../../models/clans');
var guild;
module.exports = {
    route: '/choice',
    method: 'get',
    init: (discordGuild) => {
        guild = discordGuild
    },
    exec: (req, res) => {
        var user = req.query.user;
        var username = req.query.username;
        if (user) {
            res.render('choice', { title: 'Hey', clans: Clans.clans, Clans: Clans, guild, user: user })
        } else if (username) {
            var member = guild.members.find(val => {
                return val.user.username === username || val.user.tag === username
            });
            if (member) {
                res.render('choice', { title: 'Hey', clans: Clans.clans, Clans: Clans, guild, user: member.id })
            } else {
                res.render('index', { message: 'Le username ' + username + ' est incorrect' })
            }
        } else {
            res.redirect('/');
        }
    }
};