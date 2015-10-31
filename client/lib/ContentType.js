/**
 * Constructor function with Content Type initialization.
 *
 * @param {Object} options The content type settings.
 */
ContentType = function (options) {

  /** Validate mandatory settings */
  check(options.ctid, String);
  check(options.collection, Mongo.Collection);
  check(options.collection._c2, Object);
  check(options.collection._c2._simpleSchema, SimpleSchema);

  // The unique identifier of this content type.
  this._ctid = options.ctid;

  // The kind of template to be used.
  this._theme = options.theme || 'default';

  // Default path prefix (defined per content type).
  this._basePath = options.base_path || '/admin/content';

  // Reference to the Mongo.Collection instance.
  this._collection = options.collection;

  // Public access to Index+CRUD routes.
  this.routes = {};

  // Store reactive display state.
  this.displays = {};

  // Define the default endpoints.
  this.defaultEndpoints = ['index', 'created', 'read', 'update', 'delete'];

  // Store allowed values based on recieved options.
  this.options = {
    endpoints: options.endpoints || {},
    resources: options.resources || {},
    labels: options.labels || {}
  }

  // Validate mandatory data before we initialize the content type.
  check(this._ctid, String);
  check(this._theme, String);
  check(this._basePath, String);

  /** Content type initialization */
  this.initialize();
}

/**
 * Run the initialization procedures.
 */
ContentType.prototype.initialize = function () {
  var self = this;
  var endpoints = this._getEndPoints();

  _.each(endpoints, function (endpoint, key){
    check(endpoint.enabled, Boolean);

    if (endpoint.enabled) {
      // Extend default endpoint displays based on received options.
      var defaultDisplay = "default";
      var option = self.options.endpoints[key];

      if (Match.test(option, Object) && Match.test(option.display, String)){
        defaultDisplay = option.display;
      }
      self.displays[key] = new ReactiveVar(defaultDisplay);

      // Creates the Router routes for each Index+CRUD endpoint.
      self._setEndpointRoute(endpoint, key);
    }
  });
}

/**
 * Builds the router route for each endpoint
 *
 * @param {String} key      The endpoint key.
 * @param {Object} endpoint The endpoint settings.
 */
ContentType.prototype._setEndpointRoute = function (endpoint, key) {
  check(endpoint, {
    enabled:    Boolean,
    name:       String,
    path:       String,
    before:     Function,
    display:    String,
    displays:   Object
  });

  check(key, String);
  check(ContentTypes.settings.router, String);

  var self = this;

  switch (ContentTypes.settings.router) {
    case 'iron_router':
      self.routes[key] = Router.route(endpoint.path, {
        name: endpoint.name,
        onBeforeAction: function () {
          // create template wrapper on demand
          var tpl = self._getEndpointTemplateWrapperName(endpoint, key)
          this.template = tpl;
          // callback for user defined before actions
          endpoint.before();
          this.next();
        },
        // @todo: user must have wrappers to each router hook
      });
      break;
    case 'flow_router':
      // @todo: add support for Flow Router.
      break;
  }
}

/**
 * Builds the  wrapper template and set the reactive
 * helper used by the wrapper template to allow reactive display update.
 *
 * @param {String} key      The endpoint key.
 * @param {Object} endpoint The endpoint settings.
 */
ContentType.prototype._getEndpointTemplateWrapperName = function (endpoint, key) {
  check(endpoint, {
    enabled:    Boolean,
    name:       String,
    path:       String,
    before:     Function,
    display:    String,
    displays:   Object
  });

  check(key, String);
  check(ContentTypes.settings.router, String);

  var self = this;

  var defaultTemplateWrapper = 'CT_default_default';
  var templateWrapper =  "CT_" + key + "_" + self._theme + "_" + self._ctid;

  // Fallback when the theme wrapper was not implemented.
  // Should never happend but just in case.
  check(Template[defaultTemplateWrapper], Blaze.Template);
  check(Template[defaultTemplateWrapper].renderFunction, Function);

  Template[templateWrapper] = new Template(templateWrapper, Template[defaultTemplateWrapper].renderFunction);

  // @todo: permit the user to define custom wrappers

  // Once we are sure the template wrapper exist, we build the route
  // with a reactive template name to allow realtime display update.
  Template[templateWrapper].helpers({
    template: function () {
      var display = self.displays[key].get();
      var template = self._getEndpointTemplateDisplayName(key, templateWrapper, display);

      self._setTemplateHooks(key, template, display);
      self._setTemplateHelpers(key, template, display);
      self._setTemplateEvents(key, template, display);
      return template;
    }
  });

  return templateWrapper;
}

/**
 * Generates a new Template based on default Template provided by theme package.
 *
 * @param  {String} key             The endpoint identifier.
 * @param  {String} templateWrapper The Template name provided by theme package.
 * @param  {String} display         The Display name.
 * @return {String}                 The recently created Template name
 */
ContentType.prototype._getEndpointTemplateDisplayName = function (key, templateWrapper, display) {
  check(key, String);
  check(templateWrapper, String);
  check(display, String);

  var self = this,
    defaultTemplateDisplay =   "CT_" + key + "_" + self._theme + '_default',
    supposedTemplateDisplay =   "CT_" + key + "_" + self._theme + '_' + display,
    notDefinedTemplateDisplay =   "CT_undefined_" + self._theme + '_default',
    copyOf = null,
    templateDisplay = null;

  // Verify that origin template exists but if not we provide
  // default display as fallback.
  if(Match.test(Template[supposedTemplateDisplay], Blaze.Template)){
    copyOf = supposedTemplateDisplay;
  } else if(Match.test(Template[defaultTemplateDisplay], Blaze.Template)){
    copyOf = defaultTemplateDisplay;
  } else {
    // user forgot to create a display for the new endpoint
    copyOf = notDefinedTemplateDisplay;
  }
  check(Template[copyOf].renderFunction, Function);


  // @todo: for custom displays is not necessary to make a new copy

  // Duplicate the default template to make it Content Type specific.
  templateDisplay = copyOf + "_" + self._ctid;
  Template[templateDisplay] = new Template('Template.' + templateDisplay, Template[copyOf].renderFunction);

  return templateDisplay;
}

/**
 * Attach helpers to Display Templates.
 *
 * @param  {String} key      The Endpoint key.
 * @param  {String} template The Meteor Template where we need to attach the helpers.
 * @param  {String} display  The Display id.
 */
ContentType.prototype._setTemplateHelpers = function (key, template, display) {
  check(key, String);
  check(template, String);
  check(display, String);
  check(Template[template], Blaze.Template);

  var self = this;
  var helpers = self._getTemplateHelpers(key);
  var option  = self.options.endpoints[key];

  // Extend display helpers based on recieved options.
  if (option && Match.test(option.displays, Object) && Match.test(option.displays[display], Match.ObjectIncluding({helpers: Object}))){
    helpers = _.extend(helpers, option.displays[display].helpers);
  }

  // Attach default helpers for the Content Type specific template.
  Template[template].helpers(helpers);
}

/**
 * Attach events to Display Templates.
 *
 * @param  {String} key      The Endpoint key.
 * @param  {String} template The Meteor Template where we need to attach the events.
 * @param  {String} display  The Display id.
 */
ContentType.prototype._setTemplateEvents = function (key, template, display) {
  check(key, String);
  check(template, String);
  check(display, String);
  check(Template[template], Blaze.Template);

  var self = this;
  var events = self._getTemplateEvents(key);
  var option  = self.options.endpoints[key];

  // Extend display events based on recieved options.
  if (option && Match.test(option.displays, Object) && Match.test(option.displays[display], Match.ObjectIncluding({events: Object}))){
    events = _.extend(events, option.displays[display].events);
  }

  // Attach default events for the Content Type specific template.
  Template[template].events(events);
}

/**
 * Attach hooks to Display Templates.
 *
 * @param  {String} key      The Endpoint key.
 * @param  {String} template The Meteor Template where we need to attach the events.
 * @param  {String} display  The Display id.
 */
ContentType.prototype._setTemplateHooks = function (key, template, display) {
  check(key, String);
  check(template, String);
  check(display, String);
  check(Template[template], Blaze.Template);

  var self = this;
  var option  = self.options.endpoints[key];

  // Extend display events based on recieved options.
  if (!option || !Match.test(option.displays, Object))
    return false;

  if(Match.test(option.displays[display], Match.ObjectIncluding({onCreated: Function})))
    Template[template].onCreated(option.displays[display].onCreated);

  if(Match.test(option.displays[display], Match.ObjectIncluding({onRendered: Function})))
    Template[template].onRendered(option.displays[display].onRendered);

  if(Match.test(option.displays[display], Match.ObjectIncluding({onDestroyed: Function})))
    Template[template].onDestroyed(option.displays[display].onDestroyed);
}

/**
 * Store the out-of-the-box Index + CRUD endpoint esqueleton. The object
 * returned here will be used to build the Router routes.
 *
 * @return {Object} The basic information needed to build the routes.
 */
ContentType.prototype._getEndPoints = function () {
  var self = this;

  var defaultEndpointProperties = {
    enabled: true,
    before: function() { return; },
    display: 'default',
    displays: {
      default: {}
    }
  }

  var endpoints = {
    index: {
      enabled: true,
      name: 'ct.'+self._ctid+'.index',
      path: self._basePath+'/'+self._ctid+'/index',
      before: function() { return; },
      display: 'default',
      displays: {
        default: {}
      }
    },
    create: {
      enabled: true,
      name: 'ct.'+this._ctid+'.create',
      path: this._basePath+'/'+this._ctid+'/create',
      before: function() { return; },
      display: 'default',
      displays: {
        default: {}
      }
    },
    read: {
      enabled: true,
      name: 'ct.'+this._ctid+'.read',
      path: this._basePath+'/'+this._ctid+'/:_id',
      before: function() { return; },
      display: 'default',
      displays: {
        default: {}
      }
    },
    update: {
      enabled: true,
      name: 'ct.'+this._ctid+'.update',
      path: this._basePath+'/'+this._ctid+'/:_id/edit',
      before: function() { return; },
      display: 'default',
      displays: {
        default: {}
      }
    },
    delete: {
      enabled: true,
      name: 'ct.'+this._ctid+'.delete',
      path: this._basePath+'/'+this._ctid+'/:_id/delete',
      before: function() { return; },
      display: 'default',
      displays: {
        default: {}
      }
    }
  }

  // Extend default endpoints based on received options.
  _.each(self.options.endpoints, function (endpoint, key) {
    if (_.isUndefined(endpoints[key])){
      endpoints[key] = {};
    }
    endpoints[key] = _.extend(endpoints[key], defaultEndpointProperties, endpoint);
  });

  return endpoints;
}

/**
 * Provide default helpers for Content Type templates.
 *
 * @param  {String} key The endpoint identifier.
 * @return {Object}     Meteor template helpers.
 */
ContentType.prototype._getTemplateHelpers = function (key) {
  check(key, String);

  var self = this;

  var helpers = {
    index: {
      meta: {
        title: 'Documents of type <strong>' + self._ctid + '</strong>'
      },
      items: function () {
        var cursor = self._collection.find({});
        return {
          cursor: cursor,
          total: cursor.count()
        };
      }
    },
    create: {
      meta: {
        title: 'Create new <strong>' + this._ctid + '</strong>'
      },
      formCollection: self._collection,
      formId: 'insert-form-'+self._ctid,
      formType: 'insert',
    },
    read: {
      meta: {
        title: 'View <strong>' + this._ctid + '</strong>'
      },
      item: function () {
        var router = self.currentRoute();
        return self._collection.findOne({_id:router.params._id});
      }
    },
    update: {
      meta: {
        title: 'Update <strong>' + this._ctid + '</strong>'
      },
      formCollection: self._collection,
      formId: 'update-form-'+self._ctid,
      formType: 'update',
      item: function () {
        var router = self.currentRoute();
        return self._collection.findOne({_id:router.params._id});
      }
    },
    delete: {
      meta: {
        title: 'Delete <strong>' + this._ctid + '</strong>'
      },
      formCollection: self._collection,
      item: function () {
        var router = self.currentRoute();
        return self._collection.findOne({_id:router.params._id});
      }
    }
  };

  //initialize helpers for custom endpoints
    if (_.isUndefined(helpers[key])){
    helpers[key] = {};
  }

  // Helpers common to all templates.
  helpers[key].ct = {
    fields: self._getSimpleSchemaFields(),
    labels: self._getTemplateLabels(),
    pathTo: {
      index:    'ct.'+self._ctid+'.index',
      create:   'ct.'+self._ctid+'.create',
      read:     'ct.'+self._ctid+'.read',
      update:   'ct.'+self._ctid+'.update',
      delete:   'ct.'+self._ctid+'.delete'
    }
  };

  return helpers[key];
}

/**
 * Provide default events for Content Type templates.
 *
 * @param  {String} key The endpoint identifier.
 * @return {Object}     Meteor template eventMap.
 */
ContentType.prototype._getTemplateEvents = function (key) {
  check(key, String);

  var self = this;

  var events = {
    index: {},
    create: {},
    read: {},
    update: {},
    delete: {}
  };

  //initialize events for custom endpoints
    if (_.isUndefined(events[key])){
    events[key] = {};
  }

  return events[key];
}

/**
 * Label abstraction layer to let this package to be i18n friendly and to
 * provide custom labels in case you are using custom displays.
 *
 * @return {Object} Key-Value strings.
 */
ContentType.prototype._getTemplateLabels = function (labels) {
  var self = this;

  var labels = {
    backToIndex: "Back to Index",
    backToDocument: "Back to Document",
    confirmOk: "Yes, I'am sure",
    deletePrefix: "You are about to delete the document",
    deleteSuffix: "This action is unrecoverable. Are you sure?",
    linkView: "View",
    linkEdit: "Edit",
    linkDelete: "Delete",
    linkCreate: "Create new document",
    totalItemsPrefix: "Found",
    totalItemsSuffix: "item/s.",
    noItemsFound: "No documents found.",
    thKey: "Key",
    thLabel: "Label",
    thValue: "Value"
  }

  _.each(self.options.labels, function (label, key) {
    if (Match.test(label, String)){
      labels[key] = label;
    }
  });

  return labels;
}

/**
 * Builds an array with field keys and labels.
 *
 * @return {Object} An array with key-value objects.
 */
ContentType.prototype._getSimpleSchemaFields = function () {
  var self = this;

  return _.map(self._collection._c2._simpleSchema._schema, function(value, key){
    return {
      key: key,
      value: value.label
    };
  });
}

/**
 * Updates the display for specific endpoint.
 *
 * @param {String} key     The endpoint key.
 * @param {String} display The display name.
 */
ContentType.prototype.setDisplay = function (key, display) {
  check(key, String);
  check(display, String);
  check(this.displays[key], ReactiveVar);

  this.displays[key].set(display);
}

/**
 * Getter returning the current route with router abstraction.
 *
 * @return {Object} The current router route.
 */
ContentType.prototype.currentRoute = function () {
  var current = false;

  switch (ContentTypes.settings.router) {
    case 'iron_router':
      current = Router.current();
      break;
    case 'flow_router':
      current = Router.current();
      break;
  }
  return current;
}