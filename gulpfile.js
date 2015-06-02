/**
 * Created by nhnent on 15. 4. 28..
 */

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect'),
    header = require('gulp-header'),
    footer = require('gulp-footer');

var pkg = require('./package.json'),
    headerBanner = [
        '/**',
        ' * !<%= pkg.name %> v<%=pkg.version%> | NHN Entertainment',
        ' */',
        ''
    ].join('\n'),
    fnHeader = [
        '(function() {',
        ''
    ].join('\n'),
    fnFooter = [
        '',
        '})();',
        ''
    ].join('\n');

var paths = {
        scripts: ['./src/js/spinbox.js', './src/js/timepicker.js', './src/js/datepicker.js'],
        image: []
    };

gulp.task('concat', function() {
    return gulp.src(paths.scripts)
        .pipe(header(fnHeader))
        .pipe(footer(fnFooter))
        .pipe(concat('date-picker.all.js', {pkg: pkg}))
        .pipe(header(headerBanner, {pkg: pkg}))
        .pipe(gulp.dest('./'));
});

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(header(fnHeader))
        .pipe(footer(fnFooter))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('date-picker.min.js', {pkg: pkg}))
        .pipe(header(headerBanner, {pkg: pkg}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'))
        .pipe(gulp.dest('./samples/js/'));
});

gulp.task('connect', function() {
   connect.server({
       port: 9998
   });
});

gulp.task('default', ['concat', 'scripts', 'connect']);