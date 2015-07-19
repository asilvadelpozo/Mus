module.exports = function (gulp, plugins) {
    'use strict';

    return function () {
        gulp.src('mus_client/src/js/**/*.js')
            .pipe(plugins.jshint('.jshintrc'))
            .pipe(plugins.jshint.reporter('default'))
            .pipe(plugins.jshint.reporter('fail'))
            .pipe(plugins.concat('main.js'))
            .pipe(gulp.dest('mus_client/dist/js'))
            .pipe(plugins.rename({ suffix: '.min' }))
            .pipe(plugins.uglify())
            .pipe(gulp.dest('mus_client/dist/js'))
            .pipe(plugins.notify({ message: 'Scripts task completed' }));
    };

};
