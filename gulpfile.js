'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

function getTask(task) {
    return require('./gulpTasks/' + task)(gulp, plugins);
}

gulp.task('nodemon', getTask('nodemon'));
gulp.task('scripts', getTask('scripts'));
gulp.task('styles', getTask('styles'));
gulp.task('images', getTask('images'));
gulp.task('webserver', getTask('webserver'));
gulp.task('test-server', getTask('jasmineNode'));
gulp.task('test-client', getTask('karma'));

gulp.task('watch', ['scripts', 'styles', 'images', 'webserver'], function () {
    gulp.watch('mus_client/src/js/**/*.js', ['scripts']);
    gulp.watch('mus_client/src/scss/**/*.scss', ['styles']);
});

gulp.task('default', ['nodemon', 'watch']);
