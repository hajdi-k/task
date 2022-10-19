const { series, src, dest, watch } = require('gulp');
const HTMLHint = require('htmlhint').HTMLHint;
const each = require('gulp-each');
const fs = require('fs');
const gutil = require('gulp-util');
const eslint = require('gulp-eslint');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');
const cachebust = require('gulp-cache-bust');

const paths = {
	html: ['src/index.html'],
	scripts: ['src/scripts/**/*.js'],
	styles: ['src/styles/**/*.scss' , 'src/styles/external/**/*.css'],
	// images: ['assets/images/**/*'],
	// fonts: ['assets/fonts/**/*']
};

const lintHTML = (done) => {
    const errors = [];

	const stream = src(paths.html)
	.pipe(each((content, file, callback) => {
		const config = JSON.parse(fs.readFileSync('linters/.htmlhintrc.json', {encoding: 'utf8'}));

		// if (file.path.search('app.js') !== -1) {
		// 	config['doctype-first'] = true;
		// }

		const messages = HTMLHint.verify(content, config);

		if (messages.length > 0) {
			gutil.log('HTMLHint had issues with', file.path);
		}

		for (const index in messages) {
			const message = messages[index];

			switch (message.type) {
				case 'error':
					gutil.log(gutil.colors.red('Error'), message.message);
					gutil.log('Line:', message.line);
					gutil.log('Column:', message.col);
					gutil.log();

					errors.push(message);

					break;
			}
		}

		callback(null, content);
	}));

	stream.end = () => {
		if (errors.length > 0) {
			done(new gutil.PluginError('lint:html', new Error('HTMLHint error. See error log above.')));

			return;
		}

		done();
	};

	return stream;
};
const lintJS = (done) => {
    return src(paths.scripts)
    .pipe(eslint({
		configFile: 'linters/.eslintrc.json'
	}))
    // Format all results at once, at the end
    .pipe(eslint.format())
    // failAfterError will emit an error (fail) just before the stream finishes if any file has an error
    .pipe(eslint.failAfterError());
};
const buildStyles = (done) => {
	return src(paths.styles)
	  .pipe(sass.sync().on('error', sass.logError))
	  .pipe(dest('dist/styles'))
	  .on('end', done);
};
const buildScripts = (done) => {
	src(paths.scripts)
		.pipe(concat('app.js'))
		.pipe(wrap('(function() {\n\'use strict\';\n\n<%= contents %>\n\n})();'))
		.pipe(dest('./dist/scripts'))
		/* .pipe(uglify({
			compress: {
				pure_funcs: ['console.log']
			}
		}))
		.pipe(rename({ extname: '.min.js' }))
		.pipe(dest('./dist/scripts')) */
		.on('end', done);
}
const buildTemplates = (done) => {
	src(paths.html)
	.pipe(cachebust({
		type: 'timestamp'
	}))
	.pipe(dest('dist'))
	.on('end', done);
}

const serve = () => {
	browserSync.init({
		notify: false,
		server: {
			baseDir: 'dist',
			routes: {
				// '/rudimental-test': 'rudimental-test',
			}
		},
		files: [
			'dist/**/*.html',
			'dist/**/*.css',
			// 'dist/images/**/*',
			// 'build/fonts/**/*'
		],
		reloadDebounce: 500
	});

	// gulp.watch(paths.images, ['images']);

	watch(paths.styles, buildStyles);
	/* watch(paths.styles, function(cb) {
		buildStyles();
		cb();
	}); */

	watch(paths.scripts, buildScripts);
	watch(paths.html, buildTemplates);
};


exports.lint = series(lintHTML, lintJS);
exports.default = series(lintHTML, buildTemplates, lintJS, buildScripts, buildStyles);
exports.serve  = series(exports.default, serve);