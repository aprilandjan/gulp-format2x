/**
 * Created by Merlin on 16/9/21.
 */

var gulp = require('gulp')
var format2x = require('./index')

gulp.task('default', function() {
    return gulp.src('./test/input/**@2x.*')
        .pipe(format2x({verbose: true}))
        .pipe(gulp.dest('./test/input'))
})