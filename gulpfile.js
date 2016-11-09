'use strict';
/*eslint-disable*/
var path = require('path');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');

var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var header = require('gulp-header');
var rename = require('gulp-rename');

var pkg = require('./package.json');
var NAME = pkg.name;
var banner = ['/**',
    ' * <%= pkg.name %>',
    ' * @author <%= pkg.author %>',
    ' * @version v<%= pkg.version %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

/**
 * Paths
 */
var SOURCE_DIR = './src/**/*',
    ENTRY = 'index.js',
    DIST = './dist';

/**
 * Configuration
 */
var config = {};
config.browserify = {
    entries: ENTRY
};
config.browserSync = {
    server: {
        index: './sample1.html',
        baseDir: './samples'
    },
    port: 3000,
    ui: {
        port: 3001
    }
};
config.browserSyncStream = {
    once: true
};
config.watchify = Object.assign({}, watchify.args, config.browserify);

/**
 * Bundle function
 */
function bundle(bundler) {
    return bundler
        .bundle()
        .on('error', function(err) {
            console.log(err.message);
            browserSync.notify('Browserify Error');
            this.emit('end');
        })
        .pipe(source(NAME + '.js'))
        .pipe(buffer())
        .pipe(header(banner, {pkg : pkg}))
        .pipe(gulp.dest(DIST))
        .pipe(gulpif(
            browserSync.active,
            browserSync.stream(config.browserSyncStream))
        )
        .pipe(uglify())
        .pipe(rename(NAME + '.min.js'))
        .pipe(header(banner, {pkg : pkg}))
        .pipe(gulp.dest(DIST));
}

/**
 * Tasks
 */
gulp.task('watch', function() {
    var bundler = watchify(browserify(config.watchify)),
        watcher = function() {
            bundle(bundler);
        };

    browserSync.init(config.browserSync);
    bundler.on('update', watcher);
    bundler.on('log', gutil.log);

    watcher();
});

gulp.task('connect', function() {
    connect.server();
    gulp.watch(SOURCE_DIR, ['bundle']);
});

gulp.task('eslint', function() {
    return gulp.src([SOURCE_DIR])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('bundle', function() {
    return bundle(browserify(config.browserify));
});
