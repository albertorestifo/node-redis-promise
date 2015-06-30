'use strict';

var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

require('regenerator/runtime');
gulp.task('test', function(done) {

  gulp.src([
    './libs/*.js'
  ])
  .pipe(istanbul({
    instrumenter: require('babel-istanbul').Instrumenter
  }))
  .pipe(istanbul.hookRequire())
  .on('finish', function() {
    gulp.src(['test/*.spec.js'])
      .pipe(mocha({reporter: 'dot'}))
      .pipe(istanbul.writeReports({
        dir: './coverage',
        reporters: ['lcov', 'text-summary']
      }))
      .on('end', done);
  });
});
