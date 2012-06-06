Cartegan
===

It's what you get when you knit a map.

Cartegan is a tool for downloading tiles from popular map services - OpenStreetMap, Google (KeyHole), Yahoo (Nokia OVI), Bing (Virtual Earth), etc.

**LEGAL WARNING**: Cartegan doesn't give you the right to cache, resell, or redistribute the image tiles you download.
OpenStreetMap does, but other providers may not. Contact your physician before prolonged use.

Install and Run (with Web GUI)
===

  0. Install [NodeJS](http://nodejs.org#download)

  1. Install and run Cartegan

        npm install -g cartegan
        # cartegan-server <port>
        cartegan-server 7070

  2. Open [Google Chrome](http://google.com/chrome) to <http://localhost:7070>
  
  3. Pick GPS coordinates, a radius, and a scale (zoom)

  4. Download! Tiles will be saved to `./cartegan-tiles` (in the current directory)

Note: In theory this will work on Windows... but it's untested. For best results use an Operating System.

Run without the Web GUI
===

    cartegan <latitude> <longitude> <min-zoom> <max-zoom> <radius> <tile-provider>
    cartegan 40.3250764 -111.6787044 17 17 500 yahoo

Downloading from a custom source
===

If you have your own provider that you would like to use for the commandline tool, edit `strategies.js`
(likely in `/usr/local/lib/node_modules/cartegan/lib/strategies.js`)
