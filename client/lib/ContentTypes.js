/**
 * Literal object to store all defined Content Types.
 */
ContentTypes = {
  settings: {
    // Set the kind of enabled router (iron_router or flow_router).
    router: 'iron_router',

    // Default template wrappers.
    templatePrefix: {
      index:  'CT_index',
      create: 'CT_create',
      read:   'CT_read',
      update: 'CT_update',
      delete: 'CT_delete'
    }
  }
};

ContentTypes.Configure = function (options) {
  this.settings = _.extend(this.settings, options);
}
