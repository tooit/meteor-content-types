/**
 * Constructor function for Content Type initialization.
 *
 * @param {Object} options The content type settings.
 */
ContentType = function (options) {

  /** Validate mandatory settings */
  check(options.ctid, String);
  check(options.collection, Mongo.Collection);
  check(options.collection._c2, Object);
  check(options.collection._c2._simpleSchema, SimpleSchema);

  /** Public properties */

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

  // Store allowed values based on constructor options.
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
 *
 * @return {[type]} [description]
 */
ContentType.prototype.initialize = function () {

  // Create all routes for this particular content type.
  this._setCRUDEndPoints();
}

/**
 * Creates the Iron Router routes for each Index+CRUD endpoint.
 */
ContentType.prototype._setCRUDEndPoints = function () {

  var self = this;
  var defaultRoutes = this._getCRUDEndPoints();

  _.each(defaultRoutes, function (route, key) {

    check(route.path, String);
    check(route.name, String);
    check(route.template, String);

    var copyOf = route.template;
    var copyTo = route.template+'_'+self._ctid;

    // Copy the default provided template to be Content Type specific.
    Template[copyTo] = new Template(copyTo, Template[copyOf].renderFunction);

    // Attach default helpers for the Content Type specific template.
    Template[route.template+'_'+self._ctid].helpers(self._getCRUDTemplateHelpers(key));

    // Set the new Content Type specific template to the route being created.
    route.template = route.template+'_'+self._ctid;

    // Create and store the Iron Router route.
    self.routes[key] = Router.route(route.path, {
      name: route.name,
      template: route.template
    });
  });
};

/**
 * Getter function to return a single endpoint data.
 *
 * @param  {String} key The endpoint identifier.
 * @return {Object}     A single endpoint data.
 */
ContentType.prototype._getCRUDEndPoint = function (key) {

  check(key, String);

  var endpoints = this._getCRUDEndPoints();

  return endpoints[key];
}

/**
 * Store the out-of-the-box Index + CRUD endpoint esqueleton. The object
 * returned here will be used to build the Router routes.
 *
 * @return {Object} The basic information needed to build the routes.
 */
ContentType.prototype._getCRUDEndPoints = function () {

  return {
    index: {
      enabled: true,
      path: this._basePath+'/'+this._ctid+'/index',
      name: 'ct.'+this._ctid+'.index',
      template: 'CT_Index_'+this._theme,
      meta: {
        title: 'List all documents of type <strong>' + this._ctid + '</strong>'
      }
    },
    create: {
      enabled: true,
      path: this._basePath+'/'+this._ctid+'/create',
      name: 'ct.'+this._ctid+'.create',
      template: 'CT_Create_'+this._theme,
      meta: {
        title: 'Create new <strong>' + this._ctid + '</strong>'
      }
    },
    read: {
      enabled: true,
      path: this._basePath+'/'+this._ctid+'/:_id',
      name: 'ct.'+this._ctid+'.read',
      template: 'CT_Read_'+this._theme,
      meta: {
        title: 'View <strong>' + this._ctid + '</strong>'
      }
    },
    update: {
      enabled: true,
      path: this._basePath+'/'+this._ctid+'/:_id/edit',
      name: 'ct.'+this._ctid+'.update',
      template: 'CT_Update_'+this._theme,
      meta: {
        title: 'Update <strong>' + this._ctid + '</strong>'
      }
    },
    delete: {
      enabled: true,
      path: this._basePath+'/'+this._ctid+'/:_id/delete',
      name: 'ct.'+this._ctid+'.delete',
      template: 'CT_Delete_'+this._theme,
      meta: {
        title: 'Delete <strong>' + this._ctid + '</strong>'
      }
    }
  }
}

/**
 * Extends the default endpoint metadata with the options passed
 * on initialization.
 *
 * @param  {String} key The endpoint identifier.
 * @return {Object}     The endpoint metadata.
 */
ContentType.prototype._getCRUDEndPointMetadata = function (key) {
  check(key, String);

  var self = this;
  var meta = {};
  var optionEndpoint = self.options.endpoints[key] || {};
  var defaultEndpoint = self._getCRUDEndPoint(key) || {};

  if(Match.test(optionEndpoint.meta, Object) && Match.test(defaultEndpoint.meta, Object)){
    meta = _.extend(defaultEndpoint.meta, optionEndpoint.meta);
  }else{
    meta = defaultEndpoint.meta;
  }

  return meta;
}

/**
 * Provide default helpers for Content Type templates.
 * @param  {String} key The endpoint identifier.
 * @return {Object}     Meteor template helpers.
 */
ContentType.prototype._getCRUDTemplateHelpers = function (key) {

  check(key, String);

  var self = this;
  var helpers = {
    index: {
      items: function () {
        var cursor = self._collection.find({});
        return {
          cursor: cursor,
          total: cursor.count()
        };
      }
    },
    create: {
      formCollection: self._collection,
      formId: 'insert-form-'+self._ctid,
      formType: 'insert',
    },
    read: {
      item: function () {
        var router = Router.current();
        return self._collection.findOne({_id:router.params._id});
      }
    },
    update: {
      formCollection: self._collection,
      formId: 'update-form-'+self._ctid,
      formType: 'update',
      item: function () {
        var router = Router.current();
        return self._collection.findOne({_id:router.params._id});
      }
    },
    delete: {
      formCollection: self._collection,
      item: function () {
        var router = Router.current();
        return self._collection.findOne({_id:router.params._id});
      }
    }
  };

  // Helpers common to all templates.
  helpers[key].ct = {
    meta: self._getCRUDEndPointMetadata(key),
    fields: self._getSchemaFields(),
    labels: self._getCRUDTemplateLabels(),
    pathTo: {
      index:    'ct.'+self._ctid+'.index',
      create:   'ct.'+self._ctid+'.create',
      read:     'ct.'+self._ctid+'.read',
      update:   'ct.'+self._ctid+'.update',
      delete:   'ct.'+self._ctid+'.delete'
    },
  };

  return helpers[key];
}

/**
 * Builds an array with field keys and its labels.
 *
 * @return {Object} An array with key-value objects.
 */
ContentType.prototype._getSchemaFields = function () {

  var self = this;

  return _.map(self._collection._c2._simpleSchema._schema, function(value, key){
    return {
      key: key,
      value: value.label
    };
  });
}

/**
 * Label abstraction layer to let this package to be i18n friendly and to
 * provide custom labels in case you are using custom templates.
 *
 * @return {Object} Key-Value strings.
 */
ContentType.prototype._getCRUDTemplateLabels = function (labels) {

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
    noItemsFound: "No documents found."
  }

  _.each(self.options.labels, function (label, key) {
    if (Match.test(label, String)){
      labels[key] = label;
    }
  });

  return labels;
}
