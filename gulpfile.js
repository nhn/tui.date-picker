/**
 * Created by nhnent on 15. 4. 28..
 */

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect');

var paths = {
        scripts: ['./src/spinbox.js', './src/timepicker.js', './src/datepicker.js'],
        image: []
    };

gulp.task('scripts', function(){
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('datepicker.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(''));
});

gulp.task('connect', function() {
   connect.server({
       port: 9998,
       livereload: true
   });
});

gulp.task('default',['scripts', 'connect']);