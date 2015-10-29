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
      self._setEndPoint(endpoint, key);
    }
  });
}

/**
 * Builds the router route, the wrapper template and set the reactive
 * helper used by the wrapper template to allow reactive display update.
 *
 * @param {String} key      The endpoint key.
 * @param {Object} endpoint The endpoint settings.
 */
ContentType.prototype._setEndPoint = function (endpoint, key) {
  check(endpoint, {
    enabled:    Boolean,
    display:    String,
    path:       String,
    name:       String,
    displays:   Object
  });

  check(key, String);
  check(ContentTypes.settings.router, String);

  var self = this;
  var templatePrefix = ContentTypes.settings.templatePrefix[key];
  var templateWrapperOf = templatePrefix+"_"+self._theme;
  var templateWrapperTo =  templatePrefix+"_"+self._theme+"_"+self._ctid;

  // Fallback when the theme wrapper was not implemented.
  // Should never happend but just in case.
  check(Template[templateWrapperOf], Blaze.Template);
  check(Template[templateWrapperOf].renderFunction, Function);

  Template[templateWrapperTo] = new Template(templateWrapperTo, Template[templateWrapperOf].renderFunction);

  // Once we are sure the template wrapper exist, we build the route
  // with a reactive template name to allow realtime display update.
  Template[templateWrapperTo].helpers({
    template: function () {
      var display = self.displays[key].get();
      var template = self._getTemplateDisplayName(key, templateWrapperOf, display);



      self._setTemplateHelpers(key, template, display);
      self._setTemplateEvents(key, template, display);

      console.log('rendering display:', display);
      console.log('rendering template:', template);
      return template;
    }
  });

  switch (ContentTypes.settings.router) {
    case 'iron_router':
      self.routes[key] = Router.route(endpoint.path, {
        name: endpoint.name,
        template: templateWrapperTo
      });
      break;
    case 'flow_router':
      // @todo: add support for Flow Router.
      break;
  }
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
 * Generates a new
 * @param  {[type]} key             [description]
 * @param  {[type]} templateWrapper [description]
 * @param  {[type]} display         [description]
 * @return {[type]}                 [description]
 */
ContentType.prototype._getTemplateDisplayName = function (key, templateWrapper, display) {
  check(key, String);
  check(templateWrapper, String);
  check(display, String);

  var self = this;
  var copyOf  = templateWrapper+'_'+display;
  var copyTo  = templateWrapper+'_'+display+'_'+self._ctid;

  // Verify that origin template exists but if not we provide
  // default display as fallback.
  if(!Match.test(Template[copyOf], Blaze.Template)){
    copyOf = templateWrapper+'_default';
  }

  check(Template[copyOf].renderFunction, Function);

  // Duplicate the default template to make it Content Type specific.
  Template[copyTo] = new Template(copyTo, Template[copyOf].renderFunction);

  return copyTo;
}

/**
 * Getter function to return a single endpoint data.
 *
 * @param  {String} key The endpoint identifier.
 * @return {Object}     A single endpoint data.
 */
ContentType.prototype._getEndPoint = function (key) {
  check(key, String);

  var endpoints = this._getEndPoints();
  return endpoints[key];
}

/**
 * Store the out-of-the-box Index + CRUD endpoint esqueleton. The object
 * returned here will be used to build the Router routes.
 *
 * @return {Object} The basic information needed to build the routes.
 */
ContentType.prototype._getEndPoints = function () {
  var self = this;

  var endpoints = {
    index: {
      enabled: true,
      display: 'default',
      path: self._basePath+'/'+self._ctid+'/index',
      name: 'ct.'+self._ctid+'.index',
      displays: {
        default: {}
      }
    },
    create: {
      enabled: true,
      display: 'default',
      path: this._basePath+'/'+this._ctid+'/create',
      name: 'ct.'+this._ctid+'.create',
      displays: {
        default: {}
      }
    },
    read: {
      enabled: true,
      display: 'default',
      path: this._basePath+'/'+this._ctid+'/:_id',
      name: 'ct.'+this._ctid+'.read',
      displays: {
        default: {}
      }
    },
    update: {
      enabled: true,
      display: 'default',
      path: this._basePath+'/'+this._ctid+'/:_id/edit',
      name: 'ct.'+this._ctid+'.update',
      displays: {
        default: {}
      }
    },
    delete: {
      enabled: true,
      display: 'default',
      path: this._basePath+'/'+this._ctid+'/:_id/delete',
      name: 'ct.'+this._ctid+'.delete',
      displays: {
        default: {}
      }
    }
  }

  // @todo: check if this is still usefull.
  _.each(self.options.endpoints, function (endpoint, key) {
    if (Match.test(endpoint.enabled, Boolean)){
      endpoints[key].enabled = endpoint.enabled;
    }
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
