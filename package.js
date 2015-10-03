Package.describe({
  name: 'daishi:blaze-google-maps',
  version: '0.0.2',
  summary: 'Easy Blaze template for Google Maps with reactivity',
  git: 'https://github.com/dai-shi/meteor-blaze-google-maps',
  documentation: 'README.md'
});

Npm.depends({
  'dot-component': '0.1.1'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.1');
  api.use('ecmascript');
  api.use('templating');
  api.use('underscore');
  api.use('cosmos:browserify@0.7.0', 'client');
  api.addFiles(['client.browserify.js', 'blaze-google-maps.html', 'blaze-google-maps.js'], 'client');
  api.export('GoogleMaps', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('templating');
  api.use('tinytest');
  api.use('daishi:blaze-google-maps', 'client');
  api.addFiles('blaze-google-maps-tests.js', 'client');
});
