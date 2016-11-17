module.exports = function (gulp, plugins) {
    'use strict';

    return function () {
        gulp.src(['./mus_server/tests/**/*Spec.js'])
            .pipe(plugins.jasmineNode({timeout: 10000}));
    };

};