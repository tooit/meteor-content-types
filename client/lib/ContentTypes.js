/**
 * Define settings to be used for all Content Types.
 */
CT = function () {
  this.settings = {
    // The kind of enabled router (iron_router or flow_router).
    router: 'flow_router',
    // Type of delete (soft or hard)
    deleteType: 'soft',
    // default content types fields
    defaultFields: ['title', 'created', 'updated']
  };
}

CT.prototype.Configure = function (options) {
  this.settings = _.extend(this.settings, options);
}

CT.prototype.getSetting = function (key) {
  return this.settings[key] || undefined;
}

ContentTypes = new CT();
