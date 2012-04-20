(function () {
  "use strict";

  var connect = require('steve')
    , connectRouter = require('connect_router')
    , request = require('ahr2')
    , tolmey = require('../tolmey').create()
    , downloader = require('./downloader')
    , app
    ;

  function grabImages(req, res) {
    var tiles = tolmey.getFlatTileCoords(req.params)
      , emitter
      ;

    emitter = downloader(function () {
      console.log('all done');
      res.end('it worketh oh so well\n');
    }, tiles, tolmey.strategies.google);

    emitter.on('error', function () {
      console.log("sad errorination!");
    });
  }

  function router(app) {
    app.post('/coords/:lat/:lon/:zoom/:maxZoom/:radius', grabImages);
    // curl -X POST http://localhost:4040/coords/10.53535/-144.7294/16/16/100
    // 16-30840-6421.jpg
    // curl -X POST http://localhost:4040/coords/33.335544/44.419178/16/16/35000
  }

  app = connect();
  app.use(connect.static(__dirname + '/public'));
  app.use(connectRouter(router));
  app.listen(4040);
}());
