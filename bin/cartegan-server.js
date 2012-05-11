/*jshint es5:true laxcomma:true node:true*/
(function () {
  "use strict";

  var connect = require('steve')
    , path = require('path')
    , connectRouter = require('connect_router')
    , request = require('ahr2')
    , tolmey = require('tolmey').create()
    , downloader = require(path.join('..', 'lib', 'index'))
    , strategies = require(path.join('..', 'lib', 'strategies'))
    , app
    ;

  function grabImages(req, res) {
    req.params.zoom = 0;

    console.log(req.params);

    var tiles = tolmey.getFlatTileCoords(req.params)
      , emitter
      ;

    emitter = downloader(function () {
      console.log('all done');
      res.end('it worketh oh so well\n');
    }, tiles, strategies[req.params.mappingSystem || 'openStreetMap']);

    emitter.on('error', function () {
      console.log("sad errorination!");
    });
  }

  function router(app) {
    app.post('/coords/:mappingSystem/:lat/:lon/:zoom/:maxZoom/:radius', grabImages);
    // curl -X POST http://localhost:4040/coords/openStreetMap/10.53535/-144.7294/16/16/100
    // 16-30840-6421.jpg
    // curl -X POST http://localhost:4040/coords/openStreetMap/33.335544/44.419178/16/16/35000
  }

  app = connect();
  app.use(connect.static(path.join(__dirname, '..', 'public')));
  app.use(connectRouter(router));

  module.exports = app;
  app.main = main;

  function main(_port) {
    var port = _port || process.argv[2] || process.env.PORT || 4040
      , server
      ;

    function onListening() {
      var address = server.address()
        ;

      console.log('Listening on', address.address + ':' + address.port);
    }
    server = app.listen(port, onListening);
  }

  if (require.main === module) {
    main();
  }
}());
