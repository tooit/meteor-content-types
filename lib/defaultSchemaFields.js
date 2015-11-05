/**
 * Default Fields schema specification.
 *
 * Used to alter the current schema attached to a collection,
 * @see ContentTypes.defaultFields
 * @see ContentType.initialize
 * @see Meteor.methods.alterSchema
*/

defaultFieldsSchema = {
  title: { title : {
    type: String,
    label: "Title",
    max: 200,
  }},
  created: { created: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    },
    autoform: { omit: true }
  }},
  updated: { updated: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    optional: true,
    denyInsert: true,
    autoform: { omit: true }
  }},
  archived: { archived: {
    type: Date,
    optional: true,
    autoform: { omit: true }
  }}
};