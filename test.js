(function () {
  "use strict";

  // entire world at levels 0-6: 5k cake
  // 7... 16k not bad
  // 8... 65k looking a bit heavy
  function getEasyTiles() {
    var i, j, k, tiles = []; 

    for (i = 0; i < 7; i += 1) {
      for (j = 0; j < Math.pow(2, i); j += 1) {
        for (k = 0; k < Math.pow(2, i); k += 1) {
          tiles.push({
              zoom: i
            , x: j
            , y: k
          });
        }
      }
    }

    return tiles;
  }

  var tolmey = require('tolmey').create()
    , strategies = require('../strategies')
    , sys = require('sys')
    , fs = require('fs')
    , path = require('path')
    , request = require('ahr2')
    , Sequence = require('sequence')
    , Join = require('join')
      // TODO sequence should have parallel option
    , iThread
    , maxThreads = 4
    , sequences = []
    , tilez
    , tiles = []
    ;

  for (iThread = 0; iThread < maxThreads; iThread += 1) {
    sequences.push(Sequence());
  }

  tilez = tolmey.getTileCoords({
      "lat": 33.335544
    , "lon": 44.419178
    , "zoom": 16
    , "maxZoom": 16
    , "radius": 35000
  })

  // --funroll-loops
  tilez.forEach(function (tiless) {
    tiless.forEach(function (tile) {
      tiles.push(tile);
    });
  });

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
    sequences[i % sequences.length].then(function (next) {
      function getTile() {
      //console.log('url:', url);
      sys.print('.');
      request.get(url).when(function (err, ahr, data) {
        var filename
          ;

        if (err) {
          console.error('err0');
          console.error(err);
          next();
          return;
        }

        filename = newfilepath + '.tmp';

        fs.writeFile(filename, data, function (err) {
          if (err) {
            console.error(err);
            return;
          }

          fs.rename(filename, newfilepath, function (err) {
            if (err) {
              console.error('err1');
              console.error(err);
            }
            next();
          });
        });
      });
      }

      fs.lstat(newfilepath, function (err, stat) {
        if (!stat) {
          getTile();
        } else {
          //sys.print('+');
          next();
        }
      });
    });

  });

  var join = Join();

  sequences.forEach(function (seq) {
    seq.then(join.add());
  });

  join.when(function () {
    sys.print('\n');
    console.log('all sequences complete');
  });

}());
