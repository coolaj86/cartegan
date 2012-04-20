(function () {
  "use strict";

  var tolmey = require('tolmey').create()
    , sys = require('sys')
    , fs = require('fs')
    , path = require('path')
    , request = require('ahr2')
    , EventEmitter = require('events').EventEmitter
    , Lateral = require('lateral')
    , strategies = require('../strategies')
    ;

  // prototype-itize and subclass as EventEmitter
  function download(callback, tiles, strategy) {
    var emitter = new EventEmitter()
      , maxThreads = 4
      , lateral
      ;

    strategy = strategy || strategies.google;

    function toFilePath(tile) {
      return path.join(__dirname, "tiles",
          String(tile.zoom) 
        + "-"
        + String(tile.y)
        + "-"
        + String(tile.x)
        + ".jpg"
      );
    }

    function handleTile(next, tile, i) {
      var url = strategy(tile, i)
        , newfilepath = toFilePath(tile)
        ;

      // have n threads requesting images at once
      function getTile() {
        var res = request.get(url)
          ;

        res.upload.on('error', function (err) {
          console.error(err);
          //fs.writeFile(newfilepath, new Buffer());
        });
        res.on('error', function (err) {
          console.error(err);
          //fs.writeFile(newfilepath, new Buffer());
        });

        res.when(function (err, ahr, data) {
          // TODO test that data is buffer with jpg contents
          // TODO keep count and halt on continual errors

          var filename
            ;

          if (err) {
            if (res.statusCode == 404) {
              sys.print('-');
              fs.writeFile(newfilepath, new Buffer(0));
            } else {
              console.error('some other error retrieving image');
            }
            //emitter.emit('error', err, '0');
            next();
            return;
          }

          filename = newfilepath + '.tmp';

          fs.writeFile(filename, data, function (err) {
            if (err) {
              emitter.emit('error', err, '1');
              next();
              return;
            }

            fs.rename(filename, newfilepath, function (err) {
              if (err) {
                emitter.emit('error', err, '2');
              }
              next();
            });
          });
        });
      }

      fs.lstat(newfilepath, function (err, stat) {
        if (!stat) {
          sys.print('.');
          emitter.emit('cache-miss', tile, url);
          getTile();
        } else {
          sys.print('+');
          emitter.emit('cache-hit', tile, url);
          next();
        }
      });

    }

    console.log('length', tiles.length);

    lateral = Lateral.create(handleTile, maxThreads);

    lateral.add(tiles).when(function () {
      callback();
      emitter.emit('end');
    });

    return emitter;
  }

  module.exports = download;
}());
