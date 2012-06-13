/*jshint node:true laxcomma:true laxbreak:true*/
(function () {
  var strategies = exports
    ;

  strategies.openStreetMap = (function () {
    var alphabet = [
            "a"
          , "b"
          , "c"
        ]
      ;

    //      server                   zoom x(long) y(lat)
    // http://b.tile.openstreetmap.org/13/4095/2722.png
    return function (tile, i) {

      return "http://" + alphabet[i % 3] + ".tile.openstreetmap.org"
        + "/"
        + tile.zoom
        + "/"
        + tile.x
        + "/"
        + tile.y
        + ".png"
        ;
    };
  }());

  strategies.google = (function () {
    var j = 0
      , galileos = [
            "G"
          , "Ga"
          , "Gal"
          , "Gali"
          , "Galil"
          , "Galile"
          , "Galileo"
        ]
      ;

    return function (tile, i) {
      j = (i || j) % 2;

      return "http://khm" + (j % 2) + ".google.com/kh/"
        + "v="
        + "113"
        + "&x="
        + tile.x
        + "&y="
        + tile.y
        + "&z="
        + tile.zoom
        + "&s="
        + galileos[j % galileos.length]
        ;
    };
  }());

  strategies.bing = (function () {
    function pad(n, p) {
      while (n.length < p) {
        n = '0' + n;
      }
      return n;
    }

    // Believe it or not, Microsoft has this documented:
    // http://msdn.microsoft.com/en-us/library/bb259689.aspx
    return function (tile) {
      var zoom = tile.zoom
        , x = tile.x
        , y = tile.y
        , x2 = pad(String(x.toString(2)), zoom + 1)
        , y2 = pad(String(y.toString(2)), zoom + 1)
        , quadkey = ''
        , k
        ;

      for (k = 0; k < y2.length; k += 1) {
        quadkey += (y2[k] + x2[k]);
      }

      // ensure that the number is positive (not two's complement)
      quadkey = parseInt('0' + quadkey, 2);

      // t0-t3
      return "http://ecn.t3.tiles.virtualearth.net/tiles/"
        + "a"
        + pad(quadkey.toString(4), zoom)
        + ".jpeg?g=915&mkt=en-us&n=z"
        ;
    }; 
  }());

  strategies.yahoo = (function () {
    return function (tile) {
      var zoom = tile.zoom
        , x = tile.x
        , y = tile.y
        ;

      return "http://4.maptile.lbs.ovi.com/maptiler/v2/maptile/279af375be/satellite.day/"
        + zoom
        + "/"
        + x
        + "/"
        + y
        + "/256/jpg?lg=ENG&token=TrLJuXVK62IQk0vuXFzaig%3D%3D&requestid=yahoo.prod&app_id=eAdkWGYRoc4RfxVo0Z4B"
        ;
    };
  }());

  strategies.nokia = (function () {
    // png8 vs jpeg... why?
    return function (tile) {
      var zoom = tile.zoom
        , x = tile.x
        , y = tile.y
        ;

      return "http://4.maptile.lbs.ovi.com/maptiler/v2/maptile/4176ef2b30/satellite.day/"
        + zoom
        + "/"
        + x
        + "/"
        + y
        + "/256/png8?token=fee2f2a877fd4a429f17207a57658582&appId=nokiaMaps"
        ;
    };
  }());

}());
