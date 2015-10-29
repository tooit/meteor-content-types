Package.describe({
  name: 'tooit:content-types',
  summary: 'A Meteor package to easly define application document types. The package main goal is to provide the Drupal content type and display architecture in the Meteor way.',
  version: '0.0.6',
  git: 'https://github.com/tooit/meteor-content-types.git'
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@0.9.3', 'METEOR@0.9.4', 'METEOR@1.0']);

  var dependencies = [
    'templating',
    'check',
    'mongo',
    'reactive-var',
    'underscore@1.0.0',
    'iron:router@1.0.9',
    'aldeed:simple-schema@1.3.2',
    'aldeed:collection2@2.0.0',
    'aldeed:autoform@5.7.1',
    'aldeed:delete-button@1.0.0'
  ];
  api.use(dependencies);
  api.imply(dependencies);

  api.addFiles([
    'client/lib/ContentType.js',
    'client/lib/ContentTypes.js',
    'client/lib/UIHelpers.js',
    'client/templates/default/index.html',
    'client/templates/default/create.html',
    'client/templates/default/read.html',
    'client/templates/default/update.html',
    'client/templates/default/delete.html'
  ], 'client');

  api.export([
    'ContentType',
    'ContentTypes',
  ], 'client');
});
