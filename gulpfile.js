/**
 * Created by nhnent on 15. 4. 28..
 */

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect');

var paths = {
        scripts: ['./src/js/spinbox.js', './src/js/timepicker.js', './src/js/datepicker.js'],
        image: []
    };

gulp.task('concat', function() {
    return gulp.src(paths.scripts)
        .pipe(concat('datepicker.all.js'))
        .pipe(gulp.dest(''));
});

gulp.task('scripts', function(){
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('datepicker.min.js'))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(''));
});

gulp.task('connect', function() {
   connect.server({
       port: 9998
   });
});

gulp.task('default',['concat', 'scripts', 'connect']);