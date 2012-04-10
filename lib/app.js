(function () {
  "use strict";

  var Tolmey = require('tolmey')
    ;

  function displayMapTileForCoordinates(event) {
    event.preventDefault();

    var converter = Tolmey.create()
      ;

    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = $('[name=map-lat]').val()
        , lon = $('[name=map-lon]').val()
        , zoom = $('[name=map-zoom]').val()
        , mapProvider = $('[name=map-provider]').val() || 'openstreetmap'
        , tile_coordinates = converter.getMercatorFromGPS(lat, lon, zoom)
        , url = converter.getTileURL(mapProvider, tile_coordinates.x, tile_coordinates.y, zoom);
        ;

      $("img#map-result").attr("src", url);
    });
  }

  function getNavigatorCoords(ev) {
    ev.preventDefault();

    navigator.geolocation.getCurrentPosition(function (position) {
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
