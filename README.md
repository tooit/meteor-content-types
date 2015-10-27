# Meteor Content Types

Content types for Meteor applications. A Meteor package to easily define
application document types.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


  - [Install](#install)
  - [Features](#features)
  - [Attributes](#attributes)
- [Basic usage](#basic-usage)
- [Options](#options)
  - [Endpoints](#endpoints)
    - [Enabling or disabling endpoints](#enabling-or-disabling-endpoints)
    - [Template default metadata](#template-default-metadata)
  - [Examples](#examples)
- [TODO](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```
meteor add tooit:content-types
```

## Features

- Index page with a paged list of all documents.
- Create, Read, Update and Delete endpoints.
- Flexible and customizable templates.

## Attributes

* **Abstract code**: you can still use Meteor.Collection, SimpleSchema, Collection2 and Autoform code without any wrappers or weird modifiers.
* **Abstract security**: You can still setup your application security using the same allow/deny methods or use ongoworks:security.

# Basic usage

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
  BooksCT = new ContentType({
    collection:   Books, // The collection defined above.
    ctid:         "book", // The unique identifier for this content type.
    title:        "Book", // Human redable name.
  });
```

This example will automatically provide the following routes:

- ##admin/content/books/index## with a simple list of documents.
- ##admin/content/books/create## with an autoform insert form (quickForm).
- ##admin/content/books/:_id## with a simple table showing all document values.
- ##admin/content/books/:_id/edit## with an autoform update form (quickForm).
- ##admin/content/books/:_id/delete## with a confirmation page (quickRemoveButton).

# Options

## Endpoints

### Enabling or disabling endpoints

By default, all Index+CRUD endpoints are enabled but you could easily disable it
in case you need to provide your our implementation.

```javascript
  BooksCT = new ContentType({
    ...
    endpoints: {
      index: {enabled: false},
      delete: {enabled: false}
    }
  });
```

### Template default metadata

By default each Index+CRUD template will have a default metadata to provide
the page title, summary, etc.

```javascript
  BooksCT = new ContentType({
    ...
    endpoints: {
      ...
      index: {
        meta: {
          title: "My Company Books",
          summary: "This is a simple list of Books",
          help: "From here you can manage all existing Books."
        }
      }
    }
  });
```

If you are overriding default templates, you could write your own keys and they
will be automatically passed to Templates as helpers under ##ct.meta##.

Depending on the theme used, some meta keys are rendered by default. For example,
the default theme will render this.

```handlebars

  {{#with ct.meta}}
    {{#if title}}<h2>{{{ title }}}</h2>{{/if}}
    {{#if summary}}<p>{{{ summary }}}</p>{{/if}}
    {{#if help}}<small>{{{ help }}}</small>{{/if}}
    <hr/>
  {{/with}}

```

You could check the default metadata rendered on each template at TEMPLATES_default.md

## Examples

- http://content-types-example.meteor.com/
- http://content-types-example-bootstrap.meteor.com/ (to be created)
- http://content-types-example-materialize.meteor.com/ (to be created)

# TODO














