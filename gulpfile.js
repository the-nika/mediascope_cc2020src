// gulp-replace
const gulp = require('gulp'),
	{ src, dest, parallel, series, watch } = gulp,
	pug = require('gulp-pug'),
	htmlbeautify = require('gulp-html-beautify'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	inject = require('gulp-inject'),
	htmlmin = require('gulp-htmlmin'),
	// replace = require('gulp-replace'),
	uglifycss = require('gulp-uglifycss'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglifyjs'),
	newer = require("gulp-newer"),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	cache = require('gulp-cache'),
	browserSync = require('browser-sync').create(),
	del = require('del'),
	dir = {
		'src': {
			root: 'src',
			pug: 'src/pug/**/*.pug',
			scss: 'src/scss/**/*.scss',
			js: 'src/js/**/*.js',
			libraries: 'src/libs/',
			bower: 'bower_components/',
			fonts: 'src/fonts/**/*',
			img: 'src/img/**/*'
		},
		'dist': {
			root: 'public_html',
			css: 'public_html/css/',
			js: 'public_html/js/',
			img: 'public_html/img/',
			fonts: 'public_html/fonts/'
		}
	},
	cssLibs = {
		'normalize' : {
			file: 'normalize.css',
			path: dir.src.libraries+'normalize/'
		},
		'videojs' : {
			file: 'video-js.css',
			path: dir.src.libraries+'videojs/'
		}
	},
	jsLibs = {
		'jquery' : {
			file: 'jquery.min.js',
			path: dir.src.bower+'jquery/dist/'
		},
		'videojs' : {
			file: 'video.js',
			path: dir.src.libraries+'videojs/'
		},
		'yt-videojs' : {
			file: 'youtube.min.js',
			path: dir.src.libraries+'videojs/'
		},
	};

//----- FTP upld start
// command for FTP connect: 
// FTP_H=<host> FTP_U=<user> FTP_P=<password> gulp deploy


var gutil = require('gutil'),
	ftp = require('vinyl-ftp'),
	user = process.env.FTP_U,
	password = process.env.FTP_P,
	host = process.env.FTP_H,
	remoteLocation = 'mediascope/';

function getFtpConnection(){
	return ftp.create({
		host: host,
		port: 21,
		user: user,
		password: password,
		log: gutil.log
	});
}

function deploy(){
     var conn = getFtpConnection(),
     	globs = [
     		dir.dist.root+'/**/*'
     	];
     return gulp.src(globs, {base: '.', buffer: false})
                .pipe(conn.newer(remoteLocation))
                .pipe(conn.dest(remoteLocation))
}

exports.deploy = deploy;

//----- FTP upld end


function log(error) {
	console.log([
		'',
		"----------ERROR MESSAGE START----------",
		("[" + error.name + " in " + error.plugin + "]"),
		error.message,
		"----------ERROR MESSAGE END----------",
		''
	].join('\n'));
	this.end();
}

function reload(done){
	browserSync.reload();
	done();
}

function serve(done){
	browserSync.init({
		server: {
			baseDir: dir.dist.root
		},
		notify: false
	});
	done();
}

function css(){
	return src(dir.src.scss)
		.pipe(sass({
			outputStyle: 'expanded'
		}))
		.pipe(autoprefixer('last 2 version'))
		.pipe(uglifycss())
		.pipe(dest(dir.dist.css));
}

function js(){
	return src(dir.src.js)
		// .pipe(uglify())
		.pipe(dest(dir.dist.js));
}

function libsCss() {
	let cssSrc = [];
	Object.getOwnPropertyNames(cssLibs).forEach( function (val, idx, array) {
		cssSrc.push( cssLibs[val].path + cssLibs[val].file );
	});

	return src(cssSrc)
		.pipe(concat('libs.min.css'))
		.pipe(uglifycss())
		.pipe(dest(dir.dist.css));
}

function libsJs() {
	let jsSrc = [];
	Object.getOwnPropertyNames(jsLibs).forEach( function (val, idx, array) {
		jsSrc.push( jsLibs[val].path + jsLibs[val].file );
	});

	return src(jsSrc)
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(dest(dir.dist.js));
}

function html(){
	let allSrc = [],
		cssDist = [],
		jsDist = [];

	// for (let cssItem in cssLibs)
	// 	cssDist.push( dir.dist.css + cssLibs[cssItem].file );

	// for (let jsItem in jsLibs)
	// 	jsDist.push( dir.dist.js + jsLibs[jsItem].file );
		
	allSrc = cssDist.concat(jsDist);
	allSrc.push('!'+dir.dist.css+'styles.css', '!'+dir.dist.js+'scripts.js', dir.dist.css+'libs.min.css', dir.dist.js+'libs.min.js');

	let srcDist = src(
			allSrc,
			{ read: false }
		),
		optionsDist = {
			ignorePath: '/'+dir.dist.root,
			addRootSlash: false,
			removeTags: 1
		},
		htmlbeautifyOptions = {
			indentSize: 1,
			indentWithTabs: true,
			inline: [],
			extra_liners: ["head", "body", "!--"] // use extra lines before comment tags
		};

	return src([
			dir.src.pug, 
			'!src/pug/layout.pug'
		])//, { since: gulp.lastRun( 'htmlDist' ) })
		.pipe(pug({
			doctype: 'html'
		})).on('error', log)
		.pipe(inject(srcDist, optionsDist))
		// .pipe((file.path == en/index.pug) ? replace("-->", "-->\n")) // use extra lines after comment tags
		.pipe(htmlbeautify(htmlbeautifyOptions))
		// .pipe(replace("-->", "-->\n")) // use extra lines after comment tags
		// .pipe(replace("\n\n", "\n")) // remove excess extra lines
		// .pipe(htmlmin({
		// 	collapseWhitespace: 1,
		// 	removeComments: 1
		// }))
		.pipe(dest(dir.dist.root));
}

function fonts() {
	return src(dir.src.fonts)
		.pipe(dest(dir.dist.fonts));
}

function img() {
	return src(dir.src.img)
		.pipe(newer(dir.dist.img))
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngquant()]
		})))
		.pipe(dest(dir.dist.img));
}


function watcher(done) {
	watch(dir.src.scss, series(css, reload));
	// watch([dir.src.bower, dir.src.libraries], series(libsCss, reload, deploy));
	watch(dir.src.js, series(js, reload));
	// watch([dir.src.bower, dir.src.libraries], series(libsJs, reload, deploy));
	watch(dir.src.pug, series(html, reload));
	watch(dir.src.img, series(img, reload));
	done();
}

async function clean() {
	return del.sync([
		dir.dist.root+'/**',
		'!'+dir.dist.root
	]);
}

function clearCache() {
	return cache.clearAll();
}

exports.clean = clean;

exports.css = css;
exports.js = js;
exports.libsCss = libsCss;
exports.libsJs = libsJs;
exports.html = html;
exports.img = img;
exports.fonts = fonts;

exports.serve = serve;
exports.watcher = watcher;
exports.reload = reload;

exports.clearCache = clearCache;

exports.default = series(
	clean, 
	parallel( css, js ), 
	parallel( libsCss, libsJs ), 
	parallel( html ),
	parallel( fonts, img ),
	parallel( serve, watcher )
);