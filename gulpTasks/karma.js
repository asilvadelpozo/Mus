module.exports = function () {
    'use strict';

    var karmaServer = require('karma').Server;

    return function (done) {
        new karmaServer({
            configFile: __dirname + '/../mus_client/karma.conf.js'
        }, done).start();
    };

};