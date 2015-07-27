'use strict';

var gulp = require('gulp'),
	wiredep = require('wiredep').stream,
	useref = require('gulp-useref'),
	//sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	clean = require('gulp-clean'),
	gulpif = require('gulp-if'),
	filter = require('gulp-filter'),
	size = require('gulp-size'),
	imagemin = require('gulp-imagemin'),
	concatCss = require('gulp-concat-css'),
	minifyCss = require('gulp-minify-css'),
	jade = require('gulp-jade'),
	prettify = require('gulp-prettify'),
	browserSync = require('browser-sync'),
	gutil = require('gulp-util'),
	ftp = require('vinyl-ftp'),
	reload = browserSync.reload;
	
// Подключем ссылки на bower components
//gulp.task('wiredep', function(){
//	gulp.src('app/*.html')
//	.pipe(wiredep())
//	.pipe(gulp.dest('app/'))
//});

// Компилируем jade в html
gulp.task('jade', function(){
	gulp.src('app/templates/pages/*.jade')
	.pipe(jade())							// компиляция
	.pipe('error', log)						// вывод ошибок
	.pipe(prettify({indent_size: 2}))		// делаем красивые отступы
	.pipe(gulp.dest('app/'))				// сохраняем в папку dest
	.pipe(reload({stream: true}));			// перезагружаем страницу browserSync-ом
});

// Подключем ссылки на bower components (переписываем wiredep под работу с jade-ом)
gulp.task('wiredep', function () {
	gulp.src('app/templates/common/*.jade')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)*\.\./
		}))
		.pipe(gulp.dest('app/templates/common/'))
});

// слежка и запуск
gulp.task('watch', function(){
	gulp.watch('app/templates/**/*.jade');
	gulp.watch('bower.json', ['wiredep']);		// если добавляется новая зависимость,то проходит сначала через wiredep
	gulp.watch([
		'app/js/**/*.js',
		'app/css/**/*.css'
	]).on('change', reload);
	
});

// задача по умолчанию
gulp.task('default', ['server', 'watch']);

// Запускаем локальный сервер (только после компиляции jade)
gulp.task('server', [jade], function(){
	bowerSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: 'app'
		}
	});
});

// Очистка папки
gulp.task('clean', function(){
	return gulp.src('dist')
	.pipe(clean())
});

// Переносим HTML, CSS, JS в папку dist
 gulp.task('useref', function(){
	var assets = useref.assets();
	return gulp.src('app/*.html')
	.pipe(assets)
	.pipe(gulpif('*.js', uglify()))
	.pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
	.pipe(assets.restore())
	.pipe(useref())
	.pipe(gulp.dest('dist'));
});

// Перенос шрифтов
 gulp.task('fonts', function(){
	gulp.src('app/fonts/*')
	.pipe(filter(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2']))
	.pipe(gulp.dest('dist/fonts/'));
});

// Картинки
 gulp.task('images', function(){
	return gulp.src('app/img/**/*')
	.pipe(imagemin({
		progressive: true,
		interlaced: true
	}))
	.pipe(gulp.dest('dist/img'));
});

// Остальные файлы, такие как favicon.ico и пр.
 gulp.task('extras', function(){
	return gulp.src([
		'app/*.*',
		'!app/*.html'
	])
	.pipe(gulp.dest('dist'));
});

// Сборка и вывод размера содержимого папки dist
 gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function (){
		return gulp.src('dist/**/*').pipe(size({title: 'build'}));
});

// Собираем папку DIST
 gulp.task('bild', ['clean'], function (){
		gulp.start('dist');
});

// Функции


// Более наглядный вывод ошибок
var log = function (error) {
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

// ДЕПЛОЙ
gulp.task('deploy', function(){
	var conn = ftp.create({
		host: '',
		user: '',
		password: '',
		parallel: 10,
		log: gutil.log
	});
	var globs = [
		'dist/**/*'
	];
	return gulp.src(globs, {base: 'dist/', buffer: false})
		.pipe(conn.dest('public_html/'))
});