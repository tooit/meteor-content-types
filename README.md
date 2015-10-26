# Meteor Content Types

A Meteor package to easily define application document types.

## Installation

```
meteor add tooit:content-types
```

## Features

### Killing

* Index page listing all documents.
* Create, Read, Update and Delete operations.

### Not so killing

* **Abstract code**: you can still use Meteor.Collection, SimpleSchema, Collection2 and Autoform code without any wrappers or weird modifiers.
* **Abstract security**: You can still setup your application security using the same allow/deny methods or use ongoworks:security.

# Basic Usage

Let's define our Collection in a Meteor client and server scope.

```
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

// Be sure to define proper insert security for untrusted code if you've removed the insecure package. Call allow/deny or use ongoworks:security.

```

Meteor's client only scope.

```javascript
CT_Books = new ContentType({
  collection:   Books, // The collection defined above.
  ctid:     'books', // The unique identifier for this content type.
  theme:    'materialize', // The default theme.
  meta: { // Some texts passed to rendered templates to display useful information.
    title:    'Books',
    summary:  'A book is a set of written, printed, illustrated, or blank sheets, made of ink, paper, parchment, or other materials, fastened together to hinge at one side. See https://en.wikipedia.org/wiki/Book',
    help:     'A book could not have a summary but it must have a title.',
    tooltip:  'Shop Books',
    icon:     '<i class="material-icons">book</i>',
    tags:     ['some-tag', 'another-tag']
  }
});
```

This example will provide by default:

- The route admin/content/books/index
- The route admin/content/books/create
- The route admin/content/books/:_id:
- The route admin/content/books/:_id/edit
- The route admin/content/books/:_id/delete
