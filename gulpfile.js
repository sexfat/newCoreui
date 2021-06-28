const {
    src,
    dest,
    series,
    parallel,
    watch
} = require('gulp');

// 開發用

//========== sass
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');// 回朔到原本開發的檔案



// 沒有壓縮的  expanded   / compressed 
function sass_style(){
    return src('dev/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'})
    .on('error', sass.logError))
    .pipe(sourcemaps.write())
    //.pipe(cleanCSS({compatibility: 'ie10'}))
//     .pipe(rename({
//         extname: '.min.css'
//    })) // 改副檔名
    .pipe(dest('dist/css'))
}

//============= 合併 html
const fileinclude = require('gulp-file-include');

function html(){
    return src('dev/*.html')
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
    }))
    .pipe(dest('dist'))
}

//============= 圖片搬家 跟 js 搬家
function img_mv(){
    return src(['dev/images/*.*' , 'dev/images/**/*.*' ])
    .pipe(dest('dist/images'))
}

function js_mv(){
    return src('dev/js/*.js')
    .pipe(dest('dist/js'))
}


// ================ 清除舊檔案 ============
 
const clean = require('gulp-clean');

function cleanfile(){
    return src('dist' , { read : false })
    .pipe(clean({force : true }))
}




// 同步瀏覽器
// ================ 瀏覽器 ============
const browserSync = require('browser-sync');
const reload = browserSync.reload;

function browser(done){
   browserSync.init({
     server: {
         baseDir : "dist",
         index: 'index.html'
     },
     port : 3000  
   });
   watch(['dev/sass/**/*.css' , 'dev/sass/*.scss'] , sass_style).on('change' , reload)
   watch(['dev/*.html' , 'dev/**/*.html'] , html).on('change' , reload)
   watch(['dev/images/*.*' , 'dev/images/**/*.*' ] , img_mv).on('change' , reload)
   watch('dev/js/*.js' , js_mv).on('change' , reload)
   done();
}

// 執行指令
exports.default =  series(img_mv ,js_mv , browser);




// +++++++++  打包上線用 +++++++

// =============  js 壓縮 | js es6 -> es5 

const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

function ugjs(){
    return src('dev/js/*.js')
    .pipe(babel({
        presets: ['@babel/env']
       }))// es6 - > es5
    .pipe(uglify()) // 壓縮js
    .pipe(dest('dist/js'))
}

// ========= css 壓縮 | autoprefix 跨瀏覽器
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');


function cleancss(){
  return src('dist/css/*.css')
  .pipe(cleanCSS({compatibility: 'ie10'}))
  .pipe(autoprefixer({
    cascade: false
   }))
  .pipe(rename({
    extname: '.min.css'
})) // 改副檔名
  .pipe(dest('dist/css')) 
}

// ======  images 壓縮
const imagemin = require('gulp-imagemin');

function min_images(){
    return src('dist/images/*.*')
    .pipe(imagemin([
        imagemin.mozjpeg({quality: 70, progressive: true}) // 壓縮品質 
    ]))
    .pipe(dest('dist/images/'))
}

exports.package = parallel( ugjs , min_images ,  cleancss);





























