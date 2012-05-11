#!/usr/bin/env node
/*jshint node:true laxcomma:true*/
(function () {
  "use strict";

  var tolmey = require('tolmey').create()
    , download = require('../lib/index')
      // TODO sequence should have parallel option
    , coords
    , path = require('path')
    , strategies = require(path.join('..', 'lib', 'strategies'))
    , strategy
    , provider
    ;

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

  /*
  coords = {
  //  "lat": 41.328768
  //, "lon": 19.467283
      "lat": 33.335544
    , "lon": 44.419178
    , "zoom": 16
    , "maxZoom": 16
    , "radius": 35000
  };
  */

  coords = {
    // cartegan <latitude> <longitude> <min-zoom> <max-zoom> <radius> <tile-provider>
      lat: process.argv[2]
    , lon: process.argv[3]
    , zoom: process.argv[4]
    , maxZoom: process.argv[5]
    , radius: process.argv[6]
  };

  provider = process.argv[7];
  strategy = strategies[coords.provider] || strategies.openStreetMap;
  download(
      function () {
        console.log('');
        console.log('all sequences complete');
      }
    , tolmey.getFlatTileCoords(coords)
    , strategy
  );

}());
