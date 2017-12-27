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
var minify = require('gulp-minify');
//const imagemin = require('gulp-imagemin');

//const babel = require('gulp-babel');
//const watcher = require('gulp-watcher');

var source = './enet';
var tests = './test';
var destination = './web_deploy';

var package = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var libraryFile = 'entity-network-'+package.version+'.js';

gulp.task('removeWeb',  function() {
    return gulp.src(destination).pipe(clean());
});

gulp.task('copyTestsJs', ['removeWeb'], function() {
    return gulp.src(path.join(tests, '/**/*.js'))
        .pipe(replace(/\/\/ #Node.js[.\W\w]*\/\/ Node.js#/gi, ''))
        .pipe(gulp.dest(destination));
});

gulp.task('copyTestsHtml', ['copyTestsJs'], function() {
    return gulp.src(path.join(tests, '/**/*.html'))
        .pipe(replace(/#lib#/g, libraryFile))
        .pipe(gulp.dest(destination));
});

gulp.task('copyTestsJson', ['copyTestsHtml'], function() {
    return gulp.src(path.join(tests, 'test.EntityLoader.json'))
        .pipe(replace(/^([.\W\w]*)$/g, 'var dataObject = $1;'))
        .pipe(rename('test.EntityLoader.json.js'))
        .pipe(gulp.dest(destination));
});

gulp.task('copySources', ['copyTestsJson'], function() {
    return gulp.src(path.join(source, '/**/*.js'))
        .pipe(replace(/\/\/ #Node.js[.\W\w]*\/\/ Node.js#/gi, ''))
        .pipe(concat(libraryFile))
        .pipe(minify({
            ext:{
                src:'-debug.js',
                min:'-min.js'
            },
            //exclude: ['tasks'],
            //ignoreFiles: ['.combo.js', '-min.js']
        }))
        .pipe(gulp.dest(destination));
});

gulp.task('compress', ['copySources'], function (cb) {
    pump([
            gulp.src(libraryFile),
            uglify(),
            gulp.dest(destination + '/' + libraryFile)
        ],
        cb
    );
});

gulp.task('processHtml', ['compress'], function() {
    return gulp.src(path.join(destination, '/test.html'))

        //.pipe(gulp.dest(path.join(destination, '/test.html')));
});

gulp.task('default', ['processHtml'],  function() {

});