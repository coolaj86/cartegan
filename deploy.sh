#!/bin/bash
cd browser-src
jade *.jade
mv index.html ../public/
pakmanager build
mv pakmanager* ../public/
