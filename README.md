# foxgis-server

[![Build Status](https://travis-ci.org/jingsam/foxgis-server.svg?branch=master)](https://travis-ci.org/jingsam/foxgis-server) [![Coverage Status](https://coveralls.io/repos/github/jingsam/foxgis-server/badge.svg?branch=master)](https://coveralls.io/github/jingsam/foxgis-server?branch=master)

An map server that supports vector tiles

## Dependencies
- mongodb
- gcc >= 4.9
- xvfb
- libgles2-mesa-dev

## Usage
```
xvfb-run -a -s '-screen 0 800x600x24' npm start
```
