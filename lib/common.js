if (Meteor.isServer) {
  Global = this;
}
if (Meteor.isClient) {
  Global = window;
}

CommonHelpers = {};

/**
 * Find a Mongo.Collection instance.
 * Get the instance of a Mongo.Collection given the collection name
 *
 * @param  {String} name  The name of the collection.
 */
CommonHelpers.getCollection = function (name) {

  for (var object in Global) {
    if (Global[object] instanceof Meteor.Collection) {
      if (Global[object]['_name'] === name) {
        return (Global[object]);
        break;
      };
    }
  }
  return undefined; // if none of the collections match
};