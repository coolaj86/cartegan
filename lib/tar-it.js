/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  var Tar = require('tar-async')
    , fs = require('fs.extra')
    , path = require('path')
    , request = require('ahr2')
    ;

  function Tarer(directory, output) {
    var me = this
      , tape
      ;

    if (true !== (this instanceof Tarer)) {
      return new Tarer(directory, output);
    }

    me._waiters = [];
    me._output = output || 'out.tar';
    me._directory = directory || 'cartegan-tiles';

    tape = new Tar({
        output: fs.createWriteStream(me._output)
    });

    fs.walk(me._directory)
      .on('file', function (root, stat, next) {
        var pathname = path.join(root, stat.name)
          , input = fs.createReadStream(pathname)
          ;

        console.log(pathname, stat.size);
        tape.append(stat.name, input, { size: stat.size }, next);
      })
      .on('end', function () {
        console.log('the eagle has landed');
        tape.close();
        me._waiters.forEach(function (fn) {
          fn(me._output);
        });
      });
  }

  Tarer.prototype.when = function (fn) {
    var me = this
      ;

    me._waiters.push(fn);
  };

  Tarer.create = function (a, b, c) {
    return new Tarer(a, b, c);
  };

  module.exports = Tarer;

  function run() {
    var tar = Tarer.create(process.argv[3] || 'cartegan-tiles', process.argv[4] || 'out.tar')
      , address = process.argv[2] || 'localhost:4030'
      ;

    tar.when(function (filename) {
      fs.readFile(filename, function (err, buf) {
        console.log('msg length:', buf.length);
        request({
            method: 'POST'
          , href: 'http://' + address
          , encodedBody: buf
          , headers: {
                "content-type": "application/x-tar"
            }
        }).when(function (err, ahr2, data) {
          console.log('happy are we', err, data && data.toString('utf8'));
        });
      });
    });
  }

  if (require.main === module) {
    run();
  }
}());
