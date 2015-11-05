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

  // The layout to be rendered as the wrapper view.
  this._layout = options.layout || 'CT_layout';

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

  check(ContentTypes.getSetting('deleteType'), String);
  check(ContentTypes.getSetting('defaultFields'), Array);

  var self = this;
  var endpoints = self._getEndPoints();
  var defaultFields = ContentTypes.getSetting('defaultFields');
  var collectionName = self._collection['_name'];

  /** Alter collection schema to add default fields */

  //extend default fields if soft delete is enabled
  if(ContentTypes.getSetting('deleteType') == 'soft') {
    defaultFields.push('archived');
  }

  Meteor.call('alterSchema', collectionName, defaultFields );

  /** Now we must creat a rute for each endpoint defined */

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
 * Builds the router route for each endpoint.
 *
 * @param {String} key      The endpoint key.
 * @param {Object} endpoint The endpoint settings.
 */
ContentType.prototype._setEndpointRoute = function (endpoint, key) {
  check(endpoint, {
    enabled:    Boolean,
    name:       String,
    path:       String,
    layout:     String,
    before:     Function,
    display:    String,
    displays:   Object
  });

  check(key, String);
  check(ContentTypes.getSetting('router'), String);

  var self = this;

  switch (ContentTypes.getSetting('router')) {
    case 'iron_router':
      self.routes[key] = Router.route(endpoint.path, {
        name: endpoint.name,
        layout: endpoint.layout,
        onBeforeAction: function () {
          // Create the template wrapper on demand.
          this.template = self._getEndpointTemplateWrapperName(endpoint, key);
          // Callback for user defined before actions.
          if(Match.test(endpoint.before, Function)){
            endpoint.before();
          }
          this.next();
        },
        // @todo: user must have wrappers to each router hook
      });
      break;
    case 'flow_router':
      var options = {
        name: endpoint.name,
        action: function () {
          // Create the template wrapper on demand.
          BlazeLayout.render(endpoint.layout, {
            content: self._getEndpointTemplateWrapperName(endpoint, key)
          });
        }
      };
      // Callback for user defined before actions.
      if(Match.test(endpoint.before, Function)){
        options.triggersEnter = [endpoint.before];
      }
      FlowRouter.route(endpoint.path, options);
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
    layout:     String,
    before:     Function,
    display:    String,
    displays:   Object
  });

  check(key, String);
  check(ContentTypes.getSetting('router'), String);

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

  var self = this;
  var displayDefault = "CT_" + key + "_" + self._theme + '_default';
  var displaySuggestion = "CT_" + key + "_" + self._theme + '_' + display;
  var displayNotFound = "CT_notfound_" + self._theme + '_default';
  var copyOf = null;
  var templateDisplay = null;
  var helperNotFound = null;

  if(Match.test(Template[displaySuggestion], Blaze.Template)){
    // If display suggestion exists, we create the content type specific
    // display template from it.
    copyOf = displaySuggestion;
  } else if(Match.test(Template[displayDefault], Blaze.Template)){
    // If no display suggestion exists, we look if the default content type
    // specific display template exists.
    copyOf = displayDefault;
  } else {
    // If no display suggestion or default template exists, we render a notfound
    // template attached to DOM as a fallback.
    copyOf = displayNotFound;
    helperNotFound = displaySuggestion;
  }
  check(Template[copyOf].renderFunction, Function);

  // @todo: for custom displays is not necessary to make a new copy.

  // Duplicate the default template to make it Content Type specific.
  templateDisplay = copyOf + "_" + self._ctid;
  Template[templateDisplay] = new Template('Template.' + templateDisplay, Template[copyOf].renderFunction);

  // Display the suggestion display template on DOM.
  if (Match.test(helperNotFound, String)){
    Template[templateDisplay].helpers({suggestion: helperNotFound, endpoint: key});
  }

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
 * Attach Blaze hooks to Display Templates.
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
 * returned here will be used to build the Router routes. This function also
 * extend default values with provided ones at constructor level.
 *
 * @return {Object} The basic endpoint information needed to build the routes.
 */
ContentType.prototype._getEndPoints = function () {
  var self = this;

  var defaultEndpointProperties = {
    enabled: true,
    layout: self._layout,
    before: function() { return; },
    display: 'default',
    displays: {
      default: {}
    }
  }

  var endpoints = {
    index: {
      name: 'ct.'+self._ctid+'.index',
      path: self._basePath+'/'+self._ctid+'/index',
    },
    create: {
      name: 'ct.'+this._ctid+'.create',
      path: this._basePath+'/'+this._ctid+'/create',
    },
    archived: {
      name: 'ct.'+self._ctid+'.archived',
      path: self._basePath+'/'+self._ctid+'/archived',
    },
    read: {
      name: 'ct.'+this._ctid+'.read',
      path: this._basePath+'/'+this._ctid+'/:_id',
    },
    update: {
      name: 'ct.'+this._ctid+'.update',
      path: this._basePath+'/'+this._ctid+'/:_id/edit',
    },
    delete: {
      name: 'ct.'+this._ctid+'.delete',
      path: this._basePath+'/'+this._ctid+'/:_id/delete',
    }
  }

  // Extend endpoints properties with defaults.
  _.each(endpoints, function (endpoint, key) {
      endpoints[key] = _.extend(endpoints[key], defaultEndpointProperties);
  });

  // Disable archived endpoint if hard delete is configured.
  if(ContentTypes.getSetting('deleteType') != 'soft') {
    endpoints.archived.enabled = false;
  }

  // Extend default endpoints based on received options.
  _.each(self.options.endpoints, function (endpoint, key) {
    if (!Match.test(endpoints[key], Object)){
      endpoints[key] = {};
    }
    endpoints[key] = _.extend(endpoints[key], defaultEndpointProperties, endpoint);
  });

  return endpoints;
}

/**
 * Provide default helpers for Content Type Display templates.
 *
 * @param  {String} key   The endpoint identifier.
 * @return {Object}       Meteor template helpers.
 */
ContentType.prototype._getTemplateHelpers = function (key) {
  check(key, String);

  var self = this;
  var isSoftDelete = ContentTypes.getSetting('deleteType') == 'soft';


  var helpers = {
    index: {
      meta: {
        title: 'Documents of type <strong>' + self._ctid + '</strong>'
      },
      items: function () {
        var q = ((isSoftDelete) ? {archived:null} : {} );
        var cursor = self._collection.find(q);
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

        var sdq = ((isSoftDelete) ? {archived:null} : {});
        var q = {_id:router.params._id};
        var query =  _.extend(q,sdq) ;

        return self._collection.findOne( query );
      },
      itemId: function (){
        var router = self.currentRoute();
        return router.params._id;
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

        var sdq = ((isSoftDelete) ? {archived:null} : {});
        var q = {_id:router.params._id};
        var query =  _.extend(q,sdq) ;

        return self._collection.findOne( query );
      },
      itemId: function (){
        var router = self.currentRoute();
        return router.params._id;
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

  //Extend helpers if archived endpoint was added
  // @see _getEndPoints
  if(isSoftDelete) {
    helpers.archived = {
      meta: {
        title: 'Archived documents of type <strong>' + self._ctid + '</strong>'
      },
      items: function () {
        var cursor = self._collection.find({archived:{$ne:null}});
        return {
          cursor: cursor,
          total: cursor.count()
        };
      }
    };
  }

  // Initialize display template helpers for custom endpoints.
  if (!Match.test(helpers[key], Object)){
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
      delete:   'ct.'+self._ctid+'.delete',
      archive: 'ct.'+self._ctid+'.archived',
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
    index: {
      'click .ct-soft-delete-btn': function (event) {
        event.preventDefault();
        var id = event.target.getAttribute('data-id');
        Meteor.call('archive', self._collection['_name'], id );
      }
    },
    create: {},
    read: {
      'click .ct-soft-delete-btn': function (event) {
        event.preventDefault();
        var id = event.target.getAttribute('data-id');
        Meteor.call('archive', self._collection['_name'], id );
      },
      'click .ct-restore-btn': function (event) {
        event.preventDefault();
        var id = event.target.getAttribute('data-id');
        Meteor.call('restore', self._collection['_name'], id );
      }
    },
    update: {
      'click .ct-soft-delete-btn': function (event) {
        event.preventDefault();
        var id = event.target.getAttribute('data-id');
        Meteor.call('archive', self._collection['_name'], id );
      },
      'click .ct-restore-btn': function (event) {
        event.preventDefault();
        var id = event.target.getAttribute('data-id');
        Meteor.call('restore', self._collection['_name'], id );
      }
    },
    delete: {}
  };

  //Extend Events if archived endpoint was added
  // @see _getEndPoints
  if(ContentTypes.getSetting('deleteType') == 'soft') {
    events.archived = {
      'click .ct-restore-btn': function (event) {
        event.preventDefault();
        var id = event.target.getAttribute('data-id');
        Meteor.call('restore', self._collection['_name'], id );
      }
    };
  }

  //Initialize events for custom endpoints
  if (!Match.test(events[key], Object)){
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
    backToArchive: "Back to Archived",
    backToDocument: "Back to Document",
    confirmOk: "Yes, I'am sure",
    deletePrefix: "You are about to delete the document",
    deleteSuffix: "This action is unrecoverable. Are you sure?",
    linkView: "View",
    linkEdit: "Edit",
    linkDelete: "Delete",
    linkRestore: "Restore",
    linkCreate: "Create new document",
    linkArchive: "View archived documents",
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

  switch (ContentTypes.getSetting('router')) {
    case 'iron_router':
      current = Router.current();
      break;
    case 'flow_router':
      current = FlowRouter.current();
      break;
  }
  return current;
}
