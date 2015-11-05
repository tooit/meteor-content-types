Meteor.methods({

  /**
   * Add default schema fields to the user collection.
   *
   * @param  {String} collection The name of the collection from wich alter the schema.
   * @param  {Array} fields      The field to add to the given collection schema.
   * @see   defaultFieldsSchema object
   */
  alterSchema: function (collection, fields) {
    var collecionInstance = CommonHelpers.getCollection(collection);

    if (!Match.test(collecionInstance, undefined)) {
      _.each(fields, function(field, key) {
        if (Match.test(defaultFieldsSchema[field], Object)) {
          collecionInstance.attachSchema(defaultFieldsSchema[field]);
        }
      });
    }
  },

  /**
   * Mark a document as archived.
   * Used when soft delete is enabled.
   *
   * @param  {String} collection  The name of the collection from where find the document.
   * @param  {String} id          The document id to mark as archived.
   */
  archive: function (collection, id) {
    var collecionInstance = CommonHelpers.getCollection(collection);
    collecionInstance.update(id, { $set: { archived: new Date() } });
  },

  /**
   * Unmark a document as archived.
   * Used when soft delete is enabled.
   *
   * @param  {String} collection  The name of the collection from where find the document.
   * @param  {String} id          The document id to unmark as archived.
   */
  restore: function (collection, id) {
    var collecionInstance = CommonHelpers.getCollection(collection);
    collecionInstance.update(id, { $set: { archived: null } });
  },
});