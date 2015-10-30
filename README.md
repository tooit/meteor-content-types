# Meteor Content Types

A Meteor package for easily define application document types. The main goal of this package is to provide the [Drupal](http://www.drupal.org/)'s content type and display architecture in a Meteor way.

## Table of Contents

- [Why this package](https://github.com/tooit/meteor-content-types/blob/master/README.md#why-this-package)
- [Install](https://github.com/tooit/meteor-content-types/blob/master/README.md#install)
- [Features](https://github.com/tooit/meteor-content-types/blob/master/README.md#features)
  - [Notes](https://github.com/tooit/meteor-content-types/blob/master/README.md#notes)
- [Basic usage](https://github.com/tooit/meteor-content-types/blob/master/README.md#basic-usage)
- [Guide](https://github.com/tooit/meteor-content-types/blob/master/README.md#guide)
  - [Endpoints and Displays](https://github.com/tooit/meteor-content-types/blob/master/README.md#endpoints-and-displays)
    - [Endpoints](https://github.com/tooit/meteor-content-types/blob/master/README.md#endpoints)
    - [Displays](https://github.com/tooit/meteor-content-types/blob/master/README.md#displays)
    - [Template helpers and events](https://github.com/tooit/meteor-content-types/blob/master/README.md#template-helpers-and-events)
    - [Labels](https://github.com/tooit/meteor-content-types/blob/master/README.md#labels)
- [Example Applications](https://github.com/tooit/meteor-content-types/blob/master/README.md#example-applications)

## Why this package

We develop the package based on this approach because, after working on several apps, we have tested packages implementing complete admin panels that we've found difficult to extend. We've also used code generators that we've found very usefull for startup apps but once the app grows, we have a lot of code out there and it results difficult to maintain.

This package is our way to find a scalable and flexible architecture to manage multiple kind of documents in the same Meteor app. We thought this design based on the lot of patterns that [Drupal](http://www.drupal.org/) implements. We are not trying to copy Drupal but to reuse several useful practices that let Drupal be one of the biggest CMS/Application Frameworks in the market.

We wish that you find this package useful for your personal and/or business apps and please any suggestion, merge or feature request or anything that you consider proper to improve this package don't hesitate in contact us at [info@tooit.com](mailto:info@tooit.com) or subscribe an issue.

## Install

```bash
meteor add tooit:content-types
```

## Features

- Index endpoint with a list of all documents.
- Create, Read, Update and Delete endpoints.
- Flexible and customizable templates.
- Reactive displays per endpoint to support different look&feel per view.
- Easy integration with i18n.

### Notes

* Abstract code. You can still use Meteor.Collection, SimpleSchema, Collection2 and Autoform.
* Abstract security. You can still setup your application security using the same allow/deny methods or use [ongoworks:security](https://github.com/ongoworks/meteor-security) package.

## Basic usage

Let's define our Collection in a Meteor client and server scope.

Here we use the awesome [SimpleSchema](https://github.com/aldeed/meteor-simple-schema) and [Collection2](https://github.com/aldeed/meteor-collection2) packages to integrate document schema and validation rules. If you don't know those packages it is advisable that you read them before continue.

```javascript
// Example taken from https://github.com/aldeed/meteor-autoform
Books = new Mongo.Collection("books");
Books.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max: 200
  },
  author: {
    type: String,
    label: "Author"
  },
  copies: {
    type: Number,
    label: "Number of copies",
    min: 0
  },
  lastCheckedOut: {
    type: Date,
    label: "Last date this book was checked out",
    optional: true
  },
  summary: {
    type: String,
    label: "Brief summary",
    optional: true,
    max: 1000
  }
}));
```

Now, in the Meteor's client-only scope.

```javascript
BooksCT = new ContentType({
  collection:       Books, // The collection defined above.
  ctid:             "book" // The content type id.
});
```

Done! Out of the box, this code will create this Router routes:

- ``admin/content/books/index``: with a plain list of documents.
- ``admin/content/books/create``: with an autoform insert form (quickForm).
- ``admin/content/books/:_id``: with a simple table showing all document values.
- ``admin/content/books/:_id/edit``: with an autoform update form (quickForm).
- ``admin/content/books/:_id/delete``: with a confirmation page (quickRemoveButton).

... with these Blaze Templates:

- ``Template.CT_index_default_book``: the default Display for the admin/content/books/index route.
- ``Template.CT_create_default_book``: the default Display for the admin/content/books/create route.
- ``Template.CT_read_default_book``: the default Display for the admin/content/books/read route.
- ``Template.CT_update_default_book``: the default Display for the admin/content/books/update route.
- ``Template.CT_delete_default_book``: the default Display for the admin/content/books/delete route.

## Guide

### Endpoints and Displays

We refer to Endpoints as entities having an specific URL (they have an specific route in the router). Each endpoint tries to accomplish one use case like could be to have a list of documents, a chart page, an insert/update form, a custom search page, etc.

Endpoints could have one or more ``displays``. A display works at the presentation layer and represents the different ways of rendering the Endpoint to different kind of visitors. Think of displays as the several ways that a content could be shown.

For example, in most apps you have a private area where some users with the role A should view (Read) a document with the fields 1, 2 and 3 but the users with role B should only see the field 2. To solve this, you could use the default "read" Endpoint for users on role A and to set a custom Display for the "Read" Endpoint that only shows the field 1.

Another use case could be to have a list of documents (Index Endpoint) that use the default Display to show all documents in a plain table and to have another display rendering cool charts and a third display showing a complex grid with advance filters. Since displays are reactive you could use tabs or buttons to trigger the reactive display rendering and let users to update the current view without reloading the route (just using Blaze updates).

See [Example Applications](https://github.com/tooit/meteor-content-types/blob/master/README.md#example-applications) below to know the several ways of using Endpoints and Displays.

#### Endpoints

You could customize each endpoint by doing something like this:

```javascript
BooksCT = new ContentType({
  collection: Books,
  ctid: "book"
  endpoints: {
    index: {
      enabled: true, // you don't need to specify this key since ``true`` is the default value for all endpoints.
    },
    create: {
      enabled: true
    },
    read: {
      enabled: true
    },
    update: {
      enabled: true
    },
    delete: {
      enabled: false // Hey! I don't want to let users to delete documents from the GUI.
    }
  }
});
```

#### Displays

Out of the box, each Endpoint has an associated ``default`` Display. You could create new reusable Displays or set any custom Display to be loaded as default on every Endpoint.

```javascript
var MyCustomChartsDisplay = {
  helpers: {
    meta: {
      title: "Awesome Charts",
      summary: "Showing Book sales report for the last year."
    },
    items: function () {
      var cursor = some_collection.find({});
      return {
        cursor: cursor,
        total: cursor.count()
      };
    }
  }
}

BooksCT = new ContentType({
  collection: Books,
  ctid: "book"
  endpoints: {
    index: {
      display: 'charts', // Here we are saying: "charts" is the default Display for this Endpoint.
      displays: {
        charts: MyCustomChartsDisplay // Here we create the new Display.
      }
    }
  }
});
```

We find ourselfs usually creating our custom Displays to extend some parts of the endpoints default behaviour. Because of that, we added the Template documentation as a start point of creating your new Displays by doing copy+pase from one of the defaults Display templates.

- [CT_index_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_index_default)
- [CT_index_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_index_default_default)
- [CT_create_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_create_default)
- [CT_create_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_create_default_default)
- [CT_read_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_read_default)
- [CT_read_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_read_default_default)
- [CT_update_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_update_default)
- [CT_update_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_update_default_default)
- [CT_delete_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_delete_default)
- [CT_delete_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_delete_default_default)

For the complete Display Template documentation

- [Bootstrap3 Theme](https://github.com/tooit/meteor-content-types-bootstrap3/blob/master/TEMPLATES_default.md#Introduction)
- [Plain HTML Theme](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#Introduction)

#### Template helpers and events

Each Display have some template helpers and eventMaps by default. You could override them or create new ones.

```javascript
var MyCustomChartDisplay = {
  helpers: {
    meta: {
      title: "Awesome Charts",
      summary: "Showing Book sales report for the last year."
      help: "<button class='help-button'>Click this button to show help.</button>."
    },
    items: function () {
      var cursor = some_collection.find({});
      return {
        cursor: cursor,
        total: cursor.count()
      };
    }
  },
  events: {
    'click .help-button': function (event) {
      // Trigger the help in a cool modal window or a fancy offset panel.
    }
  }
}

BooksCT = new ContentType({
  collection: Books,
  ctid: "book"
  endpoints: {
    index: {
      display: 'charts', // Here we are saying: "charts" is the default Display for this Endpoint.
      displays: {
        charts: MyCustomChartsDisplay // Here we create the new Display.
      }
    }
  }
});
```

#### Labels

Provided templates recieves the ``ct.labels`` object with several text labels. You could modify texts using i18n labels or just create new ones.

```javascript
BooksCT = new ContentType({
  ...
  labels: {
    deletePrefix: "Hey, pay attention!! The delete action is unrecoverable!! You are about to delete ",
    deleteSuffix: "Are you 110% positive?",
    noItemsFound: _.t("No books found.") // Any i18n implementation.
  }
});
```

## Example Applications

- [Basic](http://content-types-example.meteor.com/)
- [Bootstrap Theme](http://content-types-example-bootstrap.meteor.com/)
- [Materialize Theme](http://content-types-example-materialize.meteor.com/)
