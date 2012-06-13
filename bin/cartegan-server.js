#!/usr/bin/env node
/*jshint es5:true laxcomma:true node:true*/
(function () {
  "use strict";

  require('http-json').init(require('http'));

  var connect = require('steve')
    , path = require('path')
    , fs = require('fs')
    , connectRouter = require('connect_router')
    , request = require('ahr2')
    , tolmey = require('tolmey').create()
    , downloader = require(path.join('..', 'lib', 'index'))
    , strategies = require(path.join('..', 'lib', 'strategies'))
    , TarIt = require('../lib/tar-it')
    , app
    ;

  function grabImages(req, res) {
    req.params.zoom = 0;

    console.log(req.params);

    console.log('getFlatTileCoords', req.params);
    var tiles = tolmey.getFlatTileCoords(req.params)
      , emitter
      ;

    emitter = downloader(function () {
      console.log('all done');
      res.json('it worketh oh so well\n');
    }, tiles, strategies[req.params.mappingSystem || 'openStreetMap']);

    emitter.on('error', function () {
      console.log("sad errorination!");
    });
  }

  // TODO put inside of steve
  function tickleResponse(res) {
    // res.tickle(); // for long-polling fun
  }

  function pushImages(req, res) {
    console.log(req.params.address);
    var address = req.params.address
      , token
      , tar
      ;

    console.log('address:', address);

    token = setInterval(tickleResponse, res);
    // because the receiving server is too simple and the client file api's
    // aren't yet cool enough to reliably store 300MiB in-browser, we use
    // do this in the server rather than through CORS XHR2
    tar = TarIt.create(); // accept defaults
    tar.when(function (filename) {
      console.log('waiting for a file sync');
      setTimeout(function () {
      fs.readFile(filename, function (err, buf) {
        console.log('msg length:', buf.length);
        request({
            method: 'POST'
          , href: 'http://' + address
          , encodedBody: buf
          , headers: {
                "content-type": "application/x-tar"
              //, "expect": "100-continue"
            }
        }).when(function (err, ahr2, data) {
          if (err) {
            console.error(err);
          }
          if (data && data.errors) {
            console.error(data.errors);
          }
          console.log('happy are we', err, data && data.toString('utf8'));
        });
      });
      }, 1000);
    });
  }

  function router(rest) {
    rest.post('/coords/:mappingSystem/:lat/:lon/:zoom/:maxZoom/:radius', grabImages);
    // curl -X POST http://localhost:4040/coords/openStreetMap/10.53535/-144.7294/16/16/100
    // 16-30840-6421.jpg
    // curl -X POST http://localhost:4040/coords/openStreetMap/33.335544/44.419178/16/16/35000

    rest.post('/push/:address', pushImages);
    rest.put('/push/:address', pushImages);
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
