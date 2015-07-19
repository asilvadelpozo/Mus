
(function () {
    'use strict';

    var express = require('express'),
        app = express(),
        http = require('http').Server(app),
        io = require('socket.io')(http),
        path = require('path'),
//      favicon = require('serve-favicon'),
        logger = require('morgan'),
        cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser');




// uncomment after placing your favicon in /public
//  app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'mus_client')));

    app.use(function (req, res) {
        res.sendfile(path.join(__dirname, 'mus_client', 'index.html'));
    });

    // set up our socket server
    require('./mus_server/sockets/musSocket')(io);

    http.listen(3000, function(){
        console.log('listening on *:3000');
    });

// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handlers

// development error handler
// will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    module.exports = app;

})();





