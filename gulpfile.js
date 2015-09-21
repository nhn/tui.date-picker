/**
 * Created by nhnent on 15. 4. 28..
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var connect = require('gulp-connect');
var header = require('gulp-header');
var footer = require('gulp-footer');
var jsinspect = require('gulp-jsinspect');
var del = require('del');
var run = require('gulp-run');
var runSequence = require('run-sequence');

var pkg = require('./package.json');

var libRoot = 'bower_components/',
    headerBanner = [
        '/* !<%= pkg.name %> v<%=pkg.version%> | NHN Entertainment */',
        ''
    ].join('\n'),
    fnHeader = [
        '',
        '(function() {',
        ''
    ].join('\n'),
    fnFooter = [
        '',
        '})();',
        ''
    ].join('\n'),
    paths = {
        scripts: ['./src/spinbox.js', './src/timepicker.js', './src/datepicker.js'],
        lib: [libRoot + 'jquery/**/*.min.js', libRoot + 'ne-code-snippet/**/*.min.js', libRoot + 'ne-component-calendar/**/*.min.js'],
        clean: [pkg.version, './latest', './samples/js', './samples/lib']
    };

gulp.task('clean', function() {
    return del(paths.clean);
});

gulp.task('copyLib', function() {
    return gulp.src(paths.lib)
        .pipe(gulp.dest('./samples/lib/'));
});

gulp.task('concat', function() {
    return gulp.src(paths.scripts)
        .pipe(header(fnHeader))
        .pipe(footer(fnFooter))
        .pipe(concat('datePicker.js', {pkg: pkg}))
        .pipe(header(headerBanner, {pkg: pkg}))
        .pipe(gulp.dest('./'));
});

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(header(fnHeader))
        .pipe(footer(fnFooter))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('datePicker.min.js', {pkg: pkg}))
        .pipe(header(headerBanner, {pkg: pkg}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'))
        .pipe(gulp.dest('./samples/js/'));
});

gulp.task('jsinspect', function() {
    return gulp.src(paths.scripts)
        .pipe(jsinspect({
            'threshold': 15,
            'identifiers': true
        }));
});

gulp.task('jsdoc', function() {
    var cmd = new run.Command('npm run doc');
    cmd.exec('',function() {
        gulp.src('./latest/**/*')
            .pipe(gulp.dest('./' + pkg.version));
    });
});

gulp.task('build', function() {
    runSequence(
        'clean',
        'copyLib',
        ['jsinspect', 'concat', 'scripts'],
        'jsdoc'
    );
});

gulp.task('connect', function() {
    connect.server({
        port: 9998
    });
});
