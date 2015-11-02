# Meteor Content Types

A Meteor package for easily define application document types. The main goal of this package is to provide the [Drupal](http://www.drupal.org/)'s content type and display architecture in a Meteor way.

If you're familiar with *"Sometimes you gotta run before you can walk."* by Tony Stark (Former CEO of Stark Industries), jump to: [Result of using this package](https://github.com/tooit/meteor-content-types/blob/master/README.md#result-of-using-this-package).

## Table of Contents

- [Why this package](https://github.com/tooit/meteor-content-types/blob/master/README.md#why-this-package)
- [Requirements](https://github.com/tooit/meteor-content-types/blob/master/README.md#requirements)
- [Install](https://github.com/tooit/meteor-content-types/blob/master/README.md#install)
- [Features](https://github.com/tooit/meteor-content-types/blob/master/README.md#features)
  - [Notes](https://github.com/tooit/meteor-content-types/blob/master/README.md#notes)
- [Basic usage](https://github.com/tooit/meteor-content-types/blob/master/README.md#basic-usage)
- [Guide](https://github.com/tooit/meteor-content-types/blob/master/README.md#guide)
  - [Endpoints and Displays](https://github.com/tooit/meteor-content-types/blob/master/README.md#endpoints-and-displays)
    - [Endpoints](https://github.com/tooit/meteor-content-types/blob/master/README.md#endpoints)
    - [Create your own Endpoints](https://github.com/tooit/meteor-content-types/blob/master/README.md#create-your-own-endpoints)
    - [Displays](https://github.com/tooit/meteor-content-types/blob/master/README.md#displays)
    - [Create your own Displays](https://github.com/tooit/meteor-content-types/blob/master/README.md#create-your-own-displays)
    - [Template helpers and events](https://github.com/tooit/meteor-content-types/blob/master/README.md#template-helpers-and-events)
    - [Labels](https://github.com/tooit/meteor-content-types/blob/master/README.md#labels)
  - [UI Registered Helpers](https://github.com/tooit/meteor-content-types/blob/master/README.md#ui-registered-helpers)
- [How this package works](https://github.com/tooit/meteor-content-types/blob/master/README.md#how-this-package-works)
- [Example Applications](https://github.com/tooit/meteor-content-types/blob/master/README.md#example-applications)
- [Result of using this package](https://github.com/tooit/meteor-content-types/blob/master/README.md#result-of-using-this-package)

## Why this package

We develop the package based on this approach because, after working on several apps, we have tested packages implementing complete admin panels that we've found difficult to extend. We've also used code generators that we've found very usefull for startup apps but once the app grows, we have a lot of code out there and it results difficult to maintain.

This package is our way to find a scalable and flexible architecture to manage multiple kind of documents in the same Meteor app. We thought this design based on the lot of patterns that [Drupal](http://www.drupal.org/) implements. We are not trying to copy Drupal but to reuse several useful practices that let Drupal be one of the biggest CMS/Application Frameworks in the market.

We wish that you find this package useful for your personal and/or business apps and please any suggestion, merge or feature request or anything that you consider proper to improve this package don't hesitate in contact us at [info@tooit.com](mailto:info@tooit.com) or subscribe an issue.

## Requirements

This package as almost every app needs a router. This package supports Flow Router as well as Iron Router (both as a "weak" dependency in package.js).

```bash
// Flow Router
meteor add kadira:flow-router kadira:blaze-layout

// Iron Router
meteor add iron:router
```

By default Flow Router is used and to setup Iron Router you need to add the following configuration somwhere in your app before loading the content types (for example at ``client/lib/config.js``.

```javascript
ContentTypes.Configure({
  router: 'iron_router'
});
```

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
  ctid:             "book", // The content type id.
  // Optional. The layout to be passed to the router.
  // If none is used a default one with "UI.dynamic template=content" will be provided.
  layout:           "MyAppLayout"
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
      enabled: true, // Default endpoints are enabled by default.
      name: 'ct.my-super-admin-app.index', // The route name, usefull for using on templates.
      path: '/my-super-admin-app/index', // The route path.
      before: function() { return; }, // A before action callback for the route.
      display: 'default', // The default display.
      displays: { // The list of Displays associated with this endpoint. See Displays below.
        default: {}
      }
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

#### Create your own Endpoints

As you know, Index+CRUD are not everything in applications. You need to create custom views, filters, checkout pages, and so on...

For these use cases, you could create your own Endpoints and write the app focused on the application structure instead of having files everywhere in big folders trees. For example:

```javascript
BooksCT = new ContentType({
  collection: Books,
  ctid: "book",
  endpoints: {
    books: {
      path: 'books',
      name: 'books',
      displays: {
        default: {
          helpers: {
            items: function () {
              var cursor = Books.find({});
              return {
                cursor: cursor,
                total: cursor.count()
              };
            }
          },
          events: {
            'click .book-view-detail': function (event) {
              Router.go('books.purchase', {_id: this._id});
            }
          }
        }
      }
    }
  }
}
```

This will create Index+CRUD endpoints plus a custom endpoint ``books`` in the path ``/books`` with a list of books and some template events.

In addition, the rendering route process will search the template called ``CT_books_default_default`` that you could implement somewhere in your app and will create a duplicated version of that template called ``CT_books_default_default_book``.

These duplicated versions are created only when someone access the route so you don't have to worry about having a lot of template instances out there that nobody uses.

#### Displays

Out of the box, each Endpoint has an associated ``default`` Display. You could extend any display:

```javascript
TasksCT = new ContentType({
  collection: Tasks,
  ctid: "task",
  endpoints: {
    index: {
      displays: {
        default: {
          helpers: {
            meta: {
              title: "This is my cool title."
            }
          }
        }
      }
    }
  }
});
```

#### Create your own Displays

You could create new reusable Displays or set any custom Display to be loaded as default on every Endpoint.

```javascript
var MyCustomChartsDisplay = {
  onRendered: function (){}, // Adding Display Template onRendered hook.
  onCreated: function (){}, // Adding Display Template onCreated hook.
  onDeleted: function (){}, // Adding Display Template onDeleted hook.
  events: {}, // Extending Display Template events by passing an eventMap.
  helpers: { // Extending Display Template helpers.
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

We find ourselfs usually creating our custom Displays to extend some parts of the endpoints default behaviour. Because of that, we added the Template documentation as a start point of creating your own Displays by doing copy+pase from one of the defaults Display templates.

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

### UI Registered Helpers

``ctGetFieldValue``: Needed to get a single property or method from any Object using a dynamic key.

```handlebars
...
{{#each cursor}}
  {{#each ct.fields}}
    <a abbr="{{value}}">{{ctGetFieldValue .. key}}</a>
  {{/each}}
{{/each}}
...
```

``ctPathFor``: This is the pathFor from iron:router and also implemented in the package arillo:meteor-flow-router-helpers. We add those here to avoid unnecesary dependencies and to allow router abstraction layer.

```handlebars
... <a href="{{ctPathFor route='someRouteName' _id='SomeId'}}">...
```

``ctDebug`` : Useful to debug template helper variables. This is not required in any way and will be removed on future releases. Use it only if you know what you are doing.

```handlebars
{{#each cursor}}{{ctDebug this}}{{/each}} <!-- This will print all cursor documents -->
{{#each ct.fields}}{{ctDebug this}}{{/each}} <!-- This will print the key names from ct.fields -->
```

## How this package works

When the constructor is called to build a new Content Type, the following steps will be run.

- Constructor:
  - Checks for mandatory options.
  - Setup default or extended values for ``_ctid``, ``_theme``, ``_basePath`` and ``_collection`` among others.
  - Run Content Type initialize procedure.

- Initializer:
  - Loop over default and extended endpoints (index, create, read, update and delete).
  - Check if each endpoint is enabled.
  - Initialize a ``ReactiveVar`` using the Display name specified at constructor level or the String 'default' if none is provided.
  - Router route setup.

- Router route:
  - Checks valid function arguments.
  - Switch based on router (iron-router or flow-router support).
  - Setup the route using ``endpoint.path``, ``endpoint.name`` and the regarding "before" (``onBeforeAction`` or ``triggersEnter``) hook (we do this by performance reasons to avoid creating content type templates not being used by never used or private routes).
    - Inside "before" hook, we create a new instance of the endpoint wrapper template attaching the ctid to create an unique template for every content type. This wrapper uses the Display ReactiveVar to allow rendering multiple template into the same route or url.
    - Inside the endpoint wrapper template helper, we copy a base Display template with extended helpers, events and hooks specified at constructor level.

- Notes:
  - If when creating new endpoints, you don't specify the wrapper template, the template CT_notfound_[theme]_default will be used to print a message on the rendered DOM.

Please, if reading this you consider that the design could be improved in any way, don't be shy and submit a new issue. :)

## Example Applications

- [Bootstrap Theme](http://content-types-example-bootstrap3.meteor.com/) (demo using kadira:flow-router)
- [Basic Theme](http://content-types-example.meteor.com/) (demo using iron:router)

## Result of using this package

Using this package let us for example create the skeleton of a Book Store and its Administrative interface in 66 lines of javascript, 42 lines of HTML and in a readable and portable structure. Thanks for reading! ;)

```javascript
BooksCT = new ContentType({
  collection: Books,
  ctid: "book",
  endpoints: {
    books: {
      path: 'books',
      name: 'books',
      displays: {
        default: {
          helpers: {
            items: function () {
              var cursor = Books.find({});
              return {
                cursor: cursor,
                total: cursor.count()
              };
            }
          },
          events: {
            'click .book-view-detail': function (event) {
              Router.go('books.purchase', {_id: this._id});
            }
          }
        }
      }
    },
    book_purchase: {
      path: 'books/purchase/:_id',
      name: 'books.purchase',
      displays: {
        default: {
          helpers: {
            item: function () {
              var router = Router.current();
              return Books.findOne({_id:router.params._id});
            }
          },
          events: {
            'click .goto-checkout': function (event) {
              alert("I'm doing a checkout from the Book default display.");
            },
            'click .goto-detail': function (event) {
              BooksCT.setDisplay('book_purchase', 'full');
            }
          }
        },
        full: {
          helpers: {
            item: function () {
              var router = Router.current();
              return Books.findOne({_id:router.params._id});
            }
          },
          events: {
            'click .goto-checkout': function (event) {
              alert("I'm doing a checkout from the Book full display.");
            },
            'click .goto-default': function (event) {
              BooksCT.setDisplay('book_purchase', 'default');
            }
          }
        }
      }
    }
  }
});
```

```handlebars
<template name="CT_book_purchase_default_default">
  <a href="{{pathFor route='books'}}">Back to Book Store</a>
  {{#with item}}
    <h1>Purchase {{title}}</h1>
    <small>By {{author}}</small><br>
    <button class="goto-detail">View Full Detail</button>
    <button class="goto-checkout">Buy this item</button>
  {{/with}}
</template>
<template name="CT_book_purchase_default_full">
  <a href="{{pathFor route='books'}}">Back to Book Store</a>
  {{#with item}}
    <h1>Purchase {{title}}</h1>
    <h2>{{summary}}</h2>
    <h3>By {{author}}</h3>
    <ul>
      <li><strong>Last Checked Out</strong>: {{lastCheckedOut}}</li>
      <li><strong>Copies</strong>: {{copies}}</li>
    </ul>
    <button class="goto-default">Hide Full Detail</button>
    <button class="goto-checkout">Buy this item</button>
  {{/with}}
</template>
<template name="CT_books_default_default">
  {{#with meta}}
    {{#if title}}<h2>{{{title}}}</h2>{{/if}}
    <hr/>
  {{/with}}
  {{#with items}}
    {{#if total}}
      {{#each cursor}}
        <h1>{{title}}</h1>
        <small>By {{author}}</small><br>
        <button class="book-view-detail">View More</button>
        <hr>
      {{/each}}
      <p>You can purchase {{total}} books.</p>
    {{else}}
      <p>No books where found.</p>
    {{/if}}
  {{/with}}
</template>
```

See [Frontend](http://content-types-example.meteor.com/books) and [Backend](http://content-types-example.meteor.com/admin/content/book/index)
