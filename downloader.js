(function () {
  "use strict";

  var tolmey = require('tolmey').create()
    , sys = require('sys')
    , fs = require('fs')
    , path = require('path')
    , request = require('ahr2')
    , strategies = require('../strategies')
    , EventEmitter = require('events').EventEmitter
    ;

      
  // TODO factor out parallel code into module
  var Sequence = require('sequence')
    , Join = require('join')
    ;

  // should be more like sequence than join
  function Parallel(_nThreads) {
    var nThreads = _nThreads || 4
      , mod = 0
      , sequences = []
      , parallel
      , join
      ;

    parallel = {
        setThreads: function (_nThreads) {
          var i
            ;

          nThreads = _nThreads;
          
          sequences = [];
          for (i = 0; i < nThreads; i += 1) {
            sequences.push(Sequence());
          }

          join = Join();
        }
      , add: function (fn) {
          mod = (mod % sequences.length);
          sequences[mod].then(fn);
          mod += 1;
        }
      , when: function (cb) {
          join.when(cb);
        }
      , start: function () {
          process.nextTick(function () {
            sequences.forEach(function (seq) {
              seq.then(join.add());
            });
          });
        }
    };

    parallel.setThreads(nThreads);
    
    return parallel;
  }

  // --funroll-loops
  function flattenTiles(coords) {
    var tilez = tolmey.getTileCoords(coords)
      , tiles = []
      ;

    tilez.forEach(function (tiless) {
      tiless.forEach(function (tile) {
        tiles.push(tile);
      });
    });

    return tiles;
  }

  // prototype-itize and subclass as EventEmitter
  function download(callback, tiles, strategy) {
    var emitter = new EventEmitter()
      , maxThreads = 4
      , parallel = Parallel(maxThreads)
      ;

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

    console.log('length', tiles.length);
    tiles.forEach(function (tile, i) {
      var url = strategies.google(tile, i)
        , newfilepath = toFilePath(tile)
        ;

      // have n threads requesting images at once
      parallel.add(function (next) {
        function getTile() {
          request.get(url).when(function (err, ahr, data) {
            // TODO test that data is buffer with jpg contents
            // TODO keep count and halt on continual errors

            var filename
              ;

            if (err) {
              emitter.emit('error', err, '0');
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
      });

    });

    parallel.when(function () {
      callback();
    });
  }

  download(
      function () {
        sys.print('\n');
        console.log('all sequences complete');
      }
    , flattenTiles({
        //  "lat": 41.328768
        //, "lon": 19.467283
          "lat": 33.335544
        , "lon": 44.419178
        , "zoom": 16
        , "maxZoom": 16
        , "radius": 50000
      })
    , strategies.google
  );

}());
