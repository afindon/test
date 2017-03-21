var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var spritesmith = require('gulp.spritesmith');
var gulpIf = require('gulp-if');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var fs = require('fs');
var del = require('del');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var scssLint = require('gulp-scss-lint');
var sassLint = require('gulp-sass-lint');
var Server = require('karma').Server;

function errorHandler(err) {
  // Logs out error in the command line
  console.log(err.toString());
  // Ends the current pipe, so Gulp watch doesn't break
  this.emit('end');
}

// Custom Plumber function for catching errors
function customPlumber(errTitle) {
  'use strict';
  if (process.env.CI) {
    return plumber({
      errorHandler: function(err) {
        throw Error(err.message);
      }
    });
  } else {
    return plumber({
      errorHandler: notify.onError({
        // Customizing error title
        title: errTitle || 'Error running Gulp',
        message: 'Error: <%= error.message %>',
      })
    });
  }
}

//gulp.task('watch', ['browserSync', 'sass'], function() {
//   gulp.watch(
//      ['app/scss/**/*.scss', 'app/templates/**/*', 'app/pages/**/*.+(html|nunjucks)', 'app/data.json'],
//     ['nunjucks'],
//     ['sass']);
// });

gulp.task('sprites', function() {
    'use strict';
    gulp.src('app/images/sprites/**/*')
        .pipe(spritesmith({
            cssName: '_sprites.scss', // CSS file
            imgName: 'sprites.png', // Image file
            // Modifies image path
            imgPath: '../images/sprites.png',
            retinaSrcFilter: 'app/images/sprites/*@2x.png',
            retinaImgName: 'sprites@2x.png',
            retinaImgPath: '../images/sprites@2x.png'
          }))
        .pipe(gulpIf('*.png', gulp.dest('app/images')))
        .pipe(gulpIf('*.scss', gulp.dest('app/scss')));
  });

gulp.task('watch-js', ['lint:js'], browserSync.reload);

gulp.task('watch', function() {
    'use strict';
    gulp.watch('app/js/**/*.js', ['watch-js']);
    gulp.watch('app/scss/**/*.scss', ['sass', 'lint:sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch([
        'app/pages/**/*.+(html|nunjucks)',
        'app/templates/**/*',
        'app/data.json'
    ], ['nunjucks']);
  });

gulp.task('sass', function() {
    'use strict';
    return gulp.src('app/scss/**/*.scss')
        .pipe(customPlumber('Error running Sass'))
        .pipe(sourcemaps.init())
        .pipe(sass({
            precision: 2,
            includePaths: ['app/bower_components']
          }))
        .pipe(autoprefixer({
            // Adds prefixes for IE8, IE9 and last 2 versions of all other browsers
            browsers: [
                '> 1%',
                'last 2 versions',
                'Firefox ESR',
                'Opera 12.1',
                'ie 9'
            ]
          }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
          }));
  });

gulp.task('browserSync', function() {
    'use strict';
    browserSync({
        server: {
            baseDir: 'app'
          },
        //      proxy: "dh.local:80",
        browser: ['google chrome', 'firefox', 'safari']

      });
  });

gulp.task('nunjucks', function() {
    'use strict';
    nunjucksRender.nunjucks.configure(['app/templates/'], {
        watch: false
      });

    // Gets .html and .nunjucks files in pages
    return gulp.src('app/pages/**/*.+(html|nunjucks)')
        // Renders template with nunjucks
        .pipe(customPlumber('Error Running Nunjucks'))

    //   .pipe(data(function() {
    //     return require('./app/data.json')
    //}))
    .pipe(data(function() {
            return JSON.parse(fs.readFileSync('./app/data.json'));
          }))
        .pipe(nunjucksRender({
            path: ['app/templates/'] // String or Array
          }))
        // output files in app folder
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({
            stream: true
          }));

  });

gulp.task('clean:dev', function() {
    'use strict';
    return del.sync([
        'app/css',
        //       'app/*.html'
    ]);
  });

// Consolidated dev phase task
gulp.task('default', function(callback) {
    'use strict';
    runSequence(
        'clean:dev', ['sprites', 'lint:js', 'lint:sass'], ['sass', 'nunjucks'], ['browserSync', 'watch'],
        callback
    );
  });

gulp.task('dev-ci', function(callback) {
    'use strict';
    runSequence(
    'clean:dev',
    ['sprites', 'lint:js', 'lint:scss'],
    ['sass', 'nunjucks'],
    callback
    );
  });

gulp.task('lint:js', function() {
    'use strict';
    return gulp.src('app/js/**/*.js')
        .pipe(customPlumber('JSHint Error'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        // Adding JSCS to lint:js task
        .pipe(jshint.reporter('fail', {
            ignoreWarning: true,
            ignoreInfo: true
          }))
        .pipe(jscs({
            fix: true,
            configPath: '.jscsrc'
          }))
        .pipe(gulp.dest('app/js'));
  });

gulp.task('lint:scss', function() {
  'use strict';
  return gulp.src('app/scss/**/*.scss')
  .pipe(scssLint({
    // Pointing to config file
    config: '.scss-lint.yml'
  }));
});

gulp.task('lint:sass', function() {
  'use strict';
  return gulp.src('app/scss/**/*.scss')
  .pipe(sassLint({

    options: {
      formatter: 'stylish',
      'merge-default-rules': true
    },
    // Pointing to config file
    config: '.sass-lint.yml'
  }))

  .pipe(sassLint.format())
  .pipe(sassLint.failOnError());
});

gulp.task('test', function(done) {
  'use strict';
  new Server({
    configFile: process.cwd() + '/karma.conf.js',
    singleRun: true
  }, done).start();
});
