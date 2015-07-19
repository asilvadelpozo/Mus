module.exports = function (gulp, plugins) {
    'use strict';

    return function () {
        gulp.src('./mus_client/src/img/*.{png,jpg}')
            .pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
            .pipe(gulp.dest('./mus_client/dist/img'))
            .pipe(plugins.notify({ message: 'Images task completed' }));
    };

};

