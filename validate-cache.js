(function () {

  var fs = require('fs')
    , path = require('path')
    , reLevels = /^(\d\d?)-(\d+)-(\d+)\.jpg/
    , sys = require('sys')
    ;

  function validateFilenames(err, nodes) {
    if (err) {
      console.error(err);
      return;
    }

    nodes.forEach(function (node) {
      var match = reLevels.exec(node)
        , zoom = parseInt(match[1], 10)
        , x = parseInt(match[2], 10)
        , y = parseInt(match[3], 10)
        ;

      if (x >= Math.pow(2, zoom) || y >= Math.pow(2, zoom) ) {
        console.log(node);
      }
    });
  }
    
  fs.readdir(path.join(__dirname, 'tiles'), validateFilenames);
}());
