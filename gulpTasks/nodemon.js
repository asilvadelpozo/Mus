module.exports = function (gulp, plugins) {
    'use strict';

    gulp.task('lint', function () {
        gulp.src(['./mus_server/**/*.js', 'app.js', './gulpTasks/**/*js'])
            .pipe(plugins.jshint('.jshintrc'))
            .pipe(plugins.jshint.reporter('default'))
            .pipe(plugins.jshint.reporter('fail'));
    });

    return function () {
        plugins.nodemon({ script: './bin/www' , ext: 'html js' , tasks: ['lint'] });
    };
};
