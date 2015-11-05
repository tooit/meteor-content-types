/**
 * Usefull to debug template helper variables. This is not required in any way
 * and will be removed on future releases. Use it only if you know what you
 * are doing.
 *
 * @param  {Anything} val   The value to show in console.log.
 */
UI.registerHelper('ctDebug', function (val) {
  console.log(val);
});

/**
 * Needed to get a single property or method from any Object using a dynamic
 * key.
 *
 * @param  {Object} item      The object from which we need the property.
 * @param  {String} key       The property name te retrieve.
 *
 * @return {String or Object} The Object value.
 */
UI.registerHelper('ctGetFieldValue', function (item, key) {
  return item[key];
});


/**
 * This is the pathFor from iron:router and also implemented in the package
 * arillo:meteor-flow-router-helpers. We add those here to avoid
 * unnecesary dependencies and to allow router abstraction layer.
 *
 * @param  {Object}    The helper options.
 * @return {String}    The path url based on route name.
 */
UI.registerHelper('ctPathFor', function (options) {
  var url, query, ref;
  switch (ContentTypes.settings.router) {
    case 'iron_router':
      // From https://github.com/iron-meteor/iron-router/blob/devel/lib/helpers.js
      var warn = Iron.utils.warn;
      var routeName;

      if (arguments.length > 1) {
        routeName = arguments[0];
        options = arguments[1] || {};
      }

      var opts = options && options.hash;
      opts = opts || {};

      var path = '';
      var query = opts.query;
      var hash = opts.hash;
      var routeName = routeName || opts.route;
      var data = _.extend({}, opts.data || this);

      var route = Router.routes[routeName];
      warn(route, "pathFor couldn't find a route named " + JSON.stringify(routeName));

      if (route) {
        _.each(route.handler.compiledUrl.keys, function (keyConfig) {
          var key = keyConfig.name;
          if (_.has(opts, key)) {
            data[key] = EJSON.clone(opts[key]);

            // so the option doesn't end up on the element as an attribute
            delete opts[key];
          }
        });

        path = route.path(data, {query: query, hash: hash});
      }

      url = path;
      break;
    case 'flow_router':
      // From https://github.com/arillo/meteor-flow-router-helpers/blob/master/client/helpers.coffee
      if (((ref = options.hash) != null ? ref.route : void 0) != null) {
        view = options;
        path = options.hash.route;
        delete options.hash.route;
      }
      query = view.hash.query ? FlowRouter._qs.parse(view.hash.query) : {};
      url = FlowRouter.path(path, view.hash, query);
      break;
  }
  return url;
});

/**
 * This let the user compare a value from ContentTypes settings
 * key.
 *
 * @param  {String} key      The key to read from ContentTypes settings.
 * @param  {String} value    the value to a make the comparation.
 *
 * @return {Boolean} The result of the comparation.
 */
UI.registerHelper('ctSettingEquals', function (key, value) {
  return ContentTypes.getSetting(key) == value;
});






