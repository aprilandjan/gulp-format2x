/**
 * Created by Merlin on 16/9/21.
 */

var through2 = require('through2')
var gutil = require('gulp-util')
var Resize = require('./Resize')
var util = require('util')

var PNG = require('pngjs').PNG
var MIME = require('mime')
var FileType = require('file-type')
var StreamToBuffer = require('stream-to-buffer')

module.exports = function(config) {
    config = config || {}
    var verbose = config.verbose || false

    var transform = function(file, encoding, callback) {

        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            var error = new gutil.PluginError('myPlugin', 'Streaming not supported');
            return callback(error);
        }

        var buffer = file.contents
        var mime = getMIMEFromBuffer(buffer)

        parseBitmap(buffer, mime, function (err, bitmap) {
            var w = Math.ceil(bitmap.width / 2) * 2
            var h = Math.ceil(bitmap.height / 2) * 2
            if(w == bitmap.width && h == bitmap.height) {
                if (verbose) {
                   console.log(`${file.path} is already even sized`)
                }
                callback(null, file)
            } else {
                if (verbose) {
                    console.log(`${file.path} (${bitmap.width}x${bitmap.height}) is not even sized, format it into (${w}x${h})`)
                }

                doResize(bitmap, w, h, function (err, bitmap) {
                    getOutputBuffer(bitmap, function (err, buffer) {
                        file.contents = buffer
                        callback(null, file);
                    })
                })
            }
        })
    };

    return through2.obj(transform);
}

function getMIMEFromBuffer(buffer, path) {
    var fileTypeFromBuffer = FileType(buffer);
    if (fileTypeFromBuffer) {
        // If FileType returns something for buffer, then return the mime given
        return fileTypeFromBuffer.mime;
    }
    else if (path) {
        // If a path is supplied, and FileType yields no results, then retry with MIME
        // Path can be either a file path or a url
        return MIME.lookup(path)
    } else {
        return null;
    }
}

function parseBitmap(buffer, mime, cb) {
    switch (mime) {
        case 'image/png':
            var png = new PNG();
            png.parse(buffer, function(err, data) {
                //  data: stream object
                if (err) {
                    return console.log('error parse buffer data')
                }
                var bitmap = {
                    data: new Buffer(data.data),
                    mime: mime,
                    width: data.width,
                    height: data.height
                };

                cb(null, bitmap);
            });
            break;
    }
}

var doResize = function (bitmap, w, h, cb) {
    w = Math.round(w);
    h = Math.round(h);

    var resize = new Resize(bitmap.width, bitmap.height, w, h, true, true, function (buffer) {
        bitmap.data = new Buffer(buffer);
        bitmap.width = w;
        bitmap.height = h;
        cb(null, bitmap);
    });
    resize.resize(bitmap.data);
}

var getOutputBuffer = function (bitmap, cb) {
    switch (bitmap.mime) {
        case 'image/png':
            var png = new PNG({
                width: bitmap.width,
                height: bitmap.height,
                bitDepth: 8,
                colorType: 6,
                inputHasAlpha: true
            });

            png.data = new Buffer(bitmap.data)

            StreamToBuffer(png.pack(), function (err, buffer) {
                return cb(null, buffer);
            });
            break;
    }
}