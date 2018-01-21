const fs = require('fs');
const path = require('path');
const merge = require('merge-stream');
const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const depend = require('gulp-depend');
const clean = require('gulp-clean');
const zip = require('gulp-zip');
const replace = require('gulp-replace');
const mocha = require('gulp-mocha');
const pump = require('pump');
const jsmin = require('gulp-jsmin');
//const imagemin = require('gulp-imagemin');

//const babel = require('gulp-babel');
//const watcher = require('gulp-watcher');

var source = './enet';
var tests = './test';
var destination = './web_deploy';
var builds = './builds';

var package = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var libraryFile = 'entity-network-'+package.version+'.js';

gulp.task('removeWeb',  function() {
    return gulp.src(destination).pipe(clean());
});

gulp.task('copyTestsJs', ['removeWeb'], function() {
    return gulp.src(path.join(tests, '/**/*.js'))
        .pipe(replace(/\/\/ #import modules[.\W\w]*\/\/ import modules#/gi, ''))
        .pipe(replace(/\/\/ #export modules[.\W\w]*\/\/ export modules#/gi, ''))
        .pipe(gulp.dest(destination));
});

gulp.task('copyTestsHtml', ['copyTestsJs'], function() {
    return gulp.src(path.join(tests, '/**/*.html'))
        .pipe(replace(/#lib#/g, libraryFile))
        .pipe(gulp.dest(destination));
});

gulp.task('copySources', ['copyTestsHtml'], function() {
    return gulp.src(path.join(source, '/**/*.js'))
        .pipe(depend())
        .pipe(replace(/\/\/ #import modules[.\W\w]*\/\/ import modules#/gi, ''))
        .pipe(replace(/\/\/ #export modules[.\W\w]*\/\/ export modules#/gi, ''))
        .pipe(concat(libraryFile))
        .pipe(jsmin())
        .pipe(gulp.dest(destination));
});


gulp.task('processHtml', ['copySources'], function() {
    return gulp.src(path.join(destination, '/test.html'))

        //.pipe(gulp.dest(path.join(destination, '/test.html')));
});

gulp.task('copytoBuilds', ['processHtml'], function() {
    return gulp.src(path.join(destination, libraryFile))
        .pipe(gulp.dest(builds));
});

gulp.task('default', ['copytoBuilds'],  function() {

});