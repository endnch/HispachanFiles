'use strict';

const { dest } = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const minify = require('gulp-minify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const config = {
    entryFile: './client/main.js',
    outputDir: './public/dist/',
    outputFile: 'app.js',
};

exports.build = () => {
    return browserify(config.entryFile)
        .transform(babelify)
        .bundle()
        .on('error', err => { console.log('Error: ' + err.message) })
        .pipe(source(config.outputFile))
        .pipe(buffer())
        .pipe(minify({
            ext: {
                src: '.js',
                min: '.min.js',
            },
        }))
        .pipe(dest(config.outputDir));
};