(function () {
  "use strict";

  var connect = require('steve')
    , connectRouter = require('connect_router')
    , request = require('ahr2')
    , tolmey = require('tolmey').create()
    , app
    ;

  function grabImages(req, res) {
    var tiles = tolmey.getTileCoords(req.params);
    console.log(tiles);
  }

  function router(app) {
    app.post('/coords/:lat/:lon/:zoom/:maxZoom/:radius', grabImages);
    // curl -X POST http://localhost:4040/coords/10.53535/-144.7294/16/16/100
  }

  app = connect();
  app.use(connect.static(__dirname + '/public'));
  app.use(connectRouter(router));
  app.listen(4040);
}());
