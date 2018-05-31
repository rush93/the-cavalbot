
const express = require('express')
const Utils = require('../utils');
const pug = require('pug');
const app = express()

const choice = require('./clans/choice');
const clan = require('./clans/clan');
const imageClan = require('./images/clan');
const imageClanSimple = require('./images/clansimple');

const routes = [
    // choice,
    // clan,
    imageClan,
    imageClanSimple
];

var initServer = function (guild) {
    app.set('view engine', 'pug')
    app.get('/', (req, res) => {
        res.render('index', { message: 'Désactivé à cause de petit con! (merci Nolat)' })
    })

    for (var i = 0; i < routes.length; i++) {
        routes[i].init(guild);
        if (routes[i].method === 'get') {
            app.get(routes[i].route, routes[i].exec);
        } else if(routes[i].method === 'post' ) {
            app.post(routes[i].route, routes[i].exec);
        }
    }

    app.listen(3000, () => Utils.log(`The web server running on port ${Utils.Color.FgYellow}3000!`));
}

module.exports = {
    initServer
};