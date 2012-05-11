#!/bin/bash
set -e -u
rm -rf public
mkdir -p public
pushd browser-src
  rsync -a ./static/ ../public/
  jade *.jade
  mv index.html ../public/
  pakmanager build
  mv pakmanaged* ../public/
popd
