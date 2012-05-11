/*jshint node:true laxcomma:true laxbreak:true browser:true*/
(function () {
  "use strict";

  var Tolmey = require('tolmey')
    , request = require('ahr2')
    , $ = require('ender')
    ;

  function scrape() {
    return {
        lat: $('[name=map-lat]').val()
      , lon: $('[name=map-lon]').val()
      , zoom: $('[name=map-zoom]').val()
      , radius: $('[name=map-radius]').val()
      , mapProvider: $('[name=map-provider]').val() || 'openStreetMap'
    };
  }

  function refreshBackground() {
    var converter = Tolmey.create()
      , userCoord = scrape()
      , coord = converter.getMercatorFromGPS(userCoord.lat, userCoord.lon, userCoord.zoom)
      , url
      , x
      , y
      , i = 0
      ;

    for (y = -1; y < 2; y += 1) {
      for (x = -1; x < 2; x += 1) {
        // TODO replace with strategy
        url = converter.getTileURL(userCoord.mapProvider, coord.x + x, coord.y + y, userCoord.zoom);
        console.log('url:' + url);

        $("img#map-tile-" + i).attr("src", url);

        i += 1;
      }
    }

  }

  function displayMapTileForCoordinates(event) {
    event.preventDefault();

    var converter = Tolmey.create()
      , userCoord = scrape()
      , lat = userCoord.lat
      , lon = userCoord.lon
      , zoom = userCoord.zoom
      , radius = userCoord.radius
      , mapProvider = userCoord.mapProvider
      , coord = converter.getMercatorFromGPS(lat, lon, zoom)
      , url = converter.getTileURL(mapProvider.toLowerCase(), coord.x, coord.y, zoom)
      , maxRadius = (Math.pow(2, (18 - zoom)) * 1000)
      , completeImg
      ;

    refreshBackground();

    /*
     * 1000 tiles per download
     * zoom | radius | power
     * 21 - 250
     * 20 - 500 - 2^(19-20) * 1000
     * 19 - 1000 - 2^(19-19) * 1000 - highest level for much of the world
     * 18 - 2000 - 2^(19-18) * 1000
     * 17 - 4000
     * 16 - 8000
     * 15 - 16000
     * 14 - 32000
     * 13 - 64000
     * 12 - 128000
     * 11 - 256000
     * 10 - 512000
     * 9 - 1024000
     * 8 - 2048000 - you might already have the whole earth at this level
     * 7 - you already have the whole earth at this level
     */
    /*
     * 16 zoom
     * radius | tiles
     * 3712-3951 :  256
     * 3952-4038 :  272
     * 4039-4135 :  289
     * 4136-     :  306
     * -5500-    :  506
     * -8000-    : 1024
     *
     */
    // TODO provide override
    if (radius > maxRadius) {
      alert('Changing your radius to ' + maxRadius
        + ' which is the maximum allowed radius for zoom level ' + zoom
        + ' (just a little over 250 tiles).'
      );
      radius = maxRadius;
    }

    completeImg = $("img#map-tile-4").attr("src");
    $("img#map-tile-4").attr("src", 'images/loading.gif');

    request.post("coords/" + mapProvider + "/" + lat + "/" + lon + "/" + zoom + "/" + zoom + "/" + radius)
      .when(function (err, ahr, data) {
        console.log(err);
        console.log(data);
        $("img#map-tile-4").attr("src", completeImg);
      });
  }

  function getNavigatorCoords(ev) {
    ev.preventDefault();

    window.navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude
        , lon = position.coords.longitude
        ;

      console.log('ll', lat, lon);
      $('[name=map-lat]').val(String(lat));
      $('[name=map-lon]').val(String(lon));
    });
  }

  $.domReady(function () {
    $("body").delegate("form", "submit", displayMapTileForCoordinates);
    $("body").delegate("button#get-coords", "click", getNavigatorCoords);
  });

}());
