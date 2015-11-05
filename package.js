Package.describe({
  name: 'tooit:content-types',
  summary: 'A Meteor package to easly define application document types like Drupal content types.',
  version: '0.0.9',
  git: 'https://github.com/tooit/meteor-content-types.git'
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@0.9.3', 'METEOR@0.9.4', 'METEOR@1.0']);

  api.use('kadira:flow-router@2.7.0', ['client'], {weak: true});
  api.use('kadira:blaze-layout@2.2.0', ['client'], {weak: true});
  api.use('iron:router@1.0.9', ['client'], {weak: true});

  var dependencies = [
    'templating',
    'check',
    'mongo',
    'ejson',
    'reactive-var',
    'underscore@1.0.0',
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
    'client/templates/default/_wrapper.html',
    'client/templates/default/index.html',
    'client/templates/default/archived.html',
    'client/templates/default/create.html',
    'client/templates/default/read.html',
    'client/templates/default/update.html',
    'client/templates/default/delete.html'
  ], 'client');

  api.addFiles([
    'lib/common.js',
    'lib/methods.js',
    'lib/defaultSchemaFields.js'
  ]);

  api.export([
    'ContentType',
    'ContentTypes',
  ], 'client');
});
