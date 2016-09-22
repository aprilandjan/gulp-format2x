# gulp-format2x

> 把一些工具(例如cutterman)生成的2x图转换成偶数宽高的, 避免在2x->1x时的像素偏差以及类似gulp-spritesmith之类的工具在读取这些图片时提示尺寸不匹配

### install

```
npm install --save-dev gulp-format2x
```

### Usage

```
var gulp = require('gulp')
var format2x = require('./index')

gulp.task('default', () => {
    return gulp.src('./test/input/**@2x.*')
        .pipe(format2x({verbose: true}))
        .pipe(gulp.dest('./test/output'))
})
```

### Config

`verbose`: whether to show files process log, 是否打印文件遍历信息

### What's more

Currently only png files are supported, 当前只支持 png 图片