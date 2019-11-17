"use strict";

// Load plugins
const path = require("path");
const glob = require("glob");
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");

const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

// Load package.json for banner
const pkg = require('./package.json');

// Global variables
const rootPath = path.resolve(__dirname, '.');
const distPath = rootPath + '/dist/';
const vendorPath = distPath + 'vendor/';

// Set the banner content
const banner = ['/*!\n',
  ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2019-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/angel-fontalvo/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del([distPath]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap JS
  var bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/*')
    .pipe(gulp.dest(vendorPath + 'bootstrap/js'));
  // Bootstrap SCSS
  var bootstrapSCSS = gulp.src('./node_modules/bootstrap/scss/**/*')
    .pipe(gulp.dest(vendorPath + 'bootstrap/scss'));
  // ChartJS
  var chartJS = gulp.src('./node_modules/chart.js/dist/*.js')
    .pipe(gulp.dest(vendorPath + 'chart.js'));
  // dataTables
  var dataTables = gulp.src([
      './node_modules/datatables.net/js/*.js',
      './node_modules/datatables.net-bs4/js/*.js',
      './node_modules/datatables.net-bs4/css/*.css'
    ])
    .pipe(gulp.dest(vendorPath + 'datatables'));
  // Font Awesome
  var fontAwesome = gulp.src('./node_modules/@fortawesome/**/*')
    .pipe(gulp.dest(vendorPath));
  // jQuery Easing
  var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
    .pipe(gulp.dest(vendorPath + 'jquery-easing'));
  // jQuery
  var jquery = gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest(vendorPath + 'jquery'));
  return merge(bootstrapJS, bootstrapSCSS, chartJS, dataTables, fontAwesome, jquery, jqueryEasing);
}

// CSS task
function css() {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      includePaths: "./node_modules",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest(distPath + "css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(distPath + "css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      './src/js/*.js',
    ])
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
    .pipe(gulp.dest(distPath + '/js'))
    .pipe(browsersync.stream());
}

// HTML task
function html() {
  return gulp
    .src([
      './src/**/*.html',
    ])
    .pipe(gulp.dest(distPath))
    .pipe(browsersync.stream());
}

// ML task
function model() {
  return gulp
    .src([
      './src/web_model/*',
    ])
    .pipe(gulp.dest(distPath + 'web_model/'))
    .pipe(browsersync.stream());
}

// Assets task
function assets() {
  return gulp
    .src([
      './src/img/*',
    ])
    .pipe(gulp.dest(distPath + 'img/'))
    .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
  gulp.watch("src/scss/**/*", css);
  gulp.watch(["src/js/**/*", "!./js/**/*.min.js"], js);
  gulp.watch("src/**/*.html", browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js, html, assets, model));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
