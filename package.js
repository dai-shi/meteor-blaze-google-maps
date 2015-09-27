Package.describe({
  name: 'daishi:blaze-google-maps',
  version: '0.0.1',
  summary: 'Easy Blaze template for Google Maps with reactivity',
  git: 'https://github.com/dai-shi/meteor-blaze-google-maps',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.1');
  api.use('ecmascript');
  api.use('templating');
  api.use('underscore');
  api.addFiles(['blaze-google-maps.html', 'blaze-google-maps.js'], 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('templating');
  api.use('tinytest');
  api.use('daishi:blaze-google-maps', 'client');
  api.addFiles('blaze-google-maps-tests.js', 'client');
});
