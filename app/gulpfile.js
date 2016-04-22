var gulp = require('gulp'),
  tinylr = require('tiny-lr'),
  neat = require('node-neat').includePaths,
  opn = require('opn');
var $ = require('gulp-load-plugins')();
var gulpDeploy = require('gulp-gh-pages');

var server = tinylr();

// when we run on the BBB, we will run this as 'bone'
// if we are in 'desktop' mode, we will mock the bonescript tools
// (since we can't install bonescript on osx)
process.env.MODE = 'desktop';

var files = {
  js: [
      'client/js/**/*.js',
      'server/**/*.js',
      'test/*.js'
    ]
};

gulp.task('lint', function(){
  return gulp.src(files.js)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

// --- Basic Tasks ---
gulp.task('css', function() {
  return gulp.src('client/css/*.scss')
    .pipe(
      $.sass({
        includePaths: ['public/css'].concat(neat),
        errLogToConsole: true
      }))
    .pipe($.csso())
    .pipe(gulp.dest('public/css/'))
    .pipe($.livereload(server));
});

gulp.task('js', function() {
  return gulp.src(
    [
      'client/js/app.js',
      'client/js/models/*.js',
      'client/js/views/*.js',
      'client/js/main.js'
    ])
    // .pipe( uglify() )
    .pipe($.concat('build.js'))
    .pipe(gulp.dest('public/js/'))
    .pipe($.livereload(server));
});

gulp.task('jslibs', function() {
  return gulp.src(
    [
      'public/lib/jquery/dist/jquery.min.js',
      'public/lib/bootstrap/dist/js/bootstrap.min.js',
      'public/lib/d3/d3.min.js',
      'public/lib/prism/prism.js',
      'public/lib/lodash/dist/lodash.min.js',
      'public/lib/backbone/backbone-min.js',
      'public/lib/nvd3/build/nv.d3.min.js',
      'public/lib/backgrid/lib/backgrid.js',
      'public/lib/backgrid-filter/backgrid-filter.min.js',
      'public/lib/backgrid-select2-cell/backgrid-select2-cell.min.js',
      'public/lib/remarkable-bootstrap-notify/dist/bootstrap-notify.min.js',
      'public/lib/bs-confirmation/bootstrap-confirmation.js',
      'public/lib/undermore/bin/undermore.js',
      'public/lib/undermore/src/$.build.js'
    ])
    // .pipe( uglify() )
    .pipe($.concat('libs.js'))
    .pipe(gulp.dest('public/js/'))
    .pipe($.livereload(server));
});

gulp.task('images', function() {
  return gulp.src('client/img/*')
    .pipe(gulp.dest('public/img/'))
    .pipe($.livereload(server));
});

gulp.task('clientviews', function() {
  return gulp.src([
    'client/views/*.jade'
  ])
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest('public/views/'))
    .pipe($.livereload(server));
});

gulp.task('serverfiles', function() {
  return $.livereload(server);
});

gulp.task('app', function() {
  require('./server/app');
});

gulp.task('watch', function() {
  server.listen(35726, function(err) {
    if (err) {
      return console.log(err);
    }

    gulp.watch(files.js, ['lint']);

    gulp.watch([
      'client/js/**/*.js'
    ], ['js']);

    gulp.watch('client/css/*.scss', ['css']);

    gulp.watch('client/js/views/libs/*.js', ['jslibs']);

    gulp.watch([
      'client/js/**/*.js'
    ], ['js']);

    gulp.watch('client/views/**/*.jade', ['clientviews']);

    gulp.watch([
      'server/app.js',
      'server/api/*.js',
      'server/data/*.json',
      'server/lib/*.js',
      'server/views/*.jade'
    ], ['serverfiles']);

  });
});

gulp.task('deploy', function() {
  return gulp.src([
    './*.*',
    './public/**/*',
    './log/**/*',
    './server/**/*'
  ], {
    base: '.'
  })
    .pipe(gulpDeploy({
      branch: 'bone'
    }));
});

gulp.task('openbrowser', function() {
  opn('http://localhost:4337');
});

// Default Task
gulp.task('build', ['lint' ,'js', 'jslibs', 'images', 'css', 'clientviews']);
gulp.task('default', ['build', 'app', 'watch', 'openbrowser']);
