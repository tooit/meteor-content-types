# Meteor Content Type Templates

This file shows the templates provided by the "default" theme. This could be used as a guide to know the default provided variables or to just copy+paste the base template to build your own placed on your app or custom package.

# Table of Contents

- [Introduction](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#Introduction)
- [Shared template helpers](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#shared_template_helpers)
- [Templates](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#templates)
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

## Introduction

All templates shares the following naming convension ``CT_[endpoint_key]_[theme_name]_[display_name]``.

The provided templates are used to build Content Type specific templates adding the content type id (ctid) at the end of the template name like ``CT_[endpoint_key]_[theme]_[display]_[ctid]``.

This way you could extend any of the template layers depending your use case.

## Shared template helpers

The following keys will be available on all display templates (not on wrapper templates) by default.

- ``meta.title``: (String) the page title.
- ``meta.summary``: (String) some description.
- ``meta.help``: (String) some useful guidelines.
- ``ct.pathTo.[endpoint_key]``: (String) the name of the route for each endpoint (useful to write links dynamically using ``{{pathFor route='ct.pathTo.index'}}``).
- ``ct.fields``: (Object) array of the fields specified in the collection's schema.
- ``ct.labels``: (Object) key-value labels.

## Templates

List of Meteor templates provided with the default theme.

### CT_index_default

The wrapper template for ``Index`` endpoint.

```handlebars
<template name="CT_index_default">
  <div>{{> Template.dynamic template=template }}</div>
</template>
```

#### Template helpers

- ``template``: a reactive var containing the name of the display to be rendered. You could update this display without running the route again by doing ``MyAwesomeContentType.setDisplay('index', 'new-display');``.

### CT_index_default_default

The default display for ``Index`` endpoint.

```handlebars
<template name="CT_index_default_default">
  {{#with meta}}
    {{#if title}}<h2>{{{title}}}</h2>{{/if}}
    {{#if summary}}<p>{{{summary}}}</p>{{/if}}
    {{#if help}}<small>{{{help}}}</small>{{/if}}
    <hr/>
  {{/with}}

  <ul>
    {{#if ct.pathTo.create}}
      <li><a href="{{pathFor route=ct.pathTo.create}}" title="{{ct.labels.linkCreate}}">{{ct.labels.linkCreate}}</a></li>
    {{/if}}
  </ul>

  {{#with items}}
    {{#if total}}
      <table width="100%" border="1">
        <thead>
          <tr>
            {{#each ct.fields}}
              <th abbr="{{ key }}">{{value}}</th>
            {{/each}}
            <th abbr="actions"></th>
          </tr>
        </thead>
        <tbody>
          {{#each cursor}}
            <tr>
              {{#each ct.fields}}
                <td abbr="{{value}}">{{ctGetFieldValue .. key}}</td>
              {{/each}}
              <td>
                {{#if ct.pathTo.read}}
                  <a href="{{pathFor route=ct.pathTo.read}}" title="{{ct.labels.linkView}}">{{ct.labels.linkView}}</a>
                {{/if}}
                {{#if ct.pathTo.update}}
                  <a href="{{pathFor route=ct.pathTo.update}}" title="{{ct.labels.linkEdit}}">{{ct.labels.linkEdit}}</a>
                {{/if}}
                {{#if ct.pathTo.delete}}
                  <a href="{{pathFor route=ct.pathTo.delete}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a>
                {{/if}}
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>
      <p>{{ct.labels.totalItemsPrefix}} <strong>{{total}}</strong> {{ct.labels.totalItemsSuffix}}</p>
    {{else}}
      <p>{{ct.labels.noItemsFound}}</p>
    {{/if}}
  {{/with}}
</template>
```

#### Template helpers

- ``item.cursor``: the mongo document reactive cursor.
- ``item.total``: total document count.
- And the rest of common helpers shared by all Index+CRUD endpoints.

### CT_create_default

The wrapper template for ``Create`` endpoint.

```handlebars
<template name="CT_create_default">
  <div>{{> Template.dynamic template=template }}</div>
</template>
```

#### Template helpers

- ``template``: a reactive var containing the name of the display to be rendered. You could update this display without running the route again by doing ``MyAwesomeContentType.setDisplay('index', 'new-display');``.

### CT_create_default_default

The default display for ``Create`` endpoint.

```handlebars
<template name="CT_create_default_default">
  {{#with meta}}
    {{#if title}}<h2>{{{title}}}</h2>{{/if}}
    {{#if summary}}<p>{{{summary}}}</p>{{/if}}
    {{#if help}}<small>{{{help}}}</small>{{/if}}
    <hr/>
  {{/with}}

  {{> quickForm collection=formCollection id=formId type=formType}}

  <ul>
    {{#if ct.pathTo.index}}
      <li><a href="{{pathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
    {{/if}}
  </ul>
</template>
```

#### Template helpers

- ``formCollection``: the collection associated to be used by autoform package.
- ``formId``: the form id to be used by autoform package.
- ``formType``: the form type to be used by autoform package.
- And the rest of common helpers shared by all Index+CRUD endpoints.

### CT_read_default

The wrapper template for ``Read`` endpoint.

```handlebars
<template name="CT_read_default">
  <div>{{> Template.dynamic template=template }}</div>
</template>
```

#### Template helpers

- ``template``: a reactive var containing the name of the display to be rendered. You could update this display without running the route again by doing ``MyAwesomeContentType.setDisplay('index', 'new-display');``.

### CT_read_default_default

The default display for ``Read`` endpoint.

```handlebars
<template name="CT_read_default_default">
  {{#with meta}}
    {{#if title}}<h2>{{{title}}}</h2>{{/if}}
    {{#if summary}}<p>{{{summary}}}</p>{{/if}}
    {{#if help}}<small>{{{help}}}</small>{{/if}}
    <hr/>
  {{/with}}

  {{#with item}}
    <table border="1">
      <thead>
        <tr>
          <th>{{ct.labels.thKey}}</th>
          <th>{{ct.labels.thLabel}}</th>
          <th>{{ct.labels.thValue}}</th>
        </tr>
      </thead>
      <tbody>
        {{#each ct.fields}}
          <tr>
            <td>{{key}}</td>
            <td>{{value}}</td>
            <td>{{ctGetFieldValue .. key}}</td>
          </tr>
        {{/each}}
      </tbody>
    </table>

    <ul>
      {{#if ct.pathTo.update}}
        <li><a href="{{pathFor route=ct.pathTo.update}}" title="{{ct.labels.linkEdit}}">{{ct.labels.linkEdit}}</a></li>
      {{/if}}
      {{#if ct.pathTo.delete}}
        <li><a href="{{pathFor route=ct.pathTo.delete}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a></li>
      {{/if}}
      {{#if ct.pathTo.index}}
        <li><a href="{{pathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
      {{/if}}
    </ul>
  {{/with}}
</template>
```

#### Template helpers

- ``item``: the mongo document about to be deleted.
- And the rest of common helpers shared by all Index+CRUD endpoints.

### CT_update_default

The wrapper template for ``Update`` endpoint.

```handlebars
<template name="CT_update_default">
  <div>{{> Template.dynamic template=template }}</div>
</template>
```

#### Template helpers

- ``template``: a reactive var containing the name of the display to be rendered. You could update this display without running the route again by doing ``MyAwesomeContentType.setDisplay('index', 'new-display');``.

### CT_update_default_default

The default display for ``Update`` endpoint.

```handlebars
<template name="CT_update_default_default">
  {{#with meta}}
    {{#if title}}<h2>{{{title}}}</h2>{{/if}}
    {{#if summary}}<p>{{{summary}}}</p>{{/if}}
    {{#if help}}<small>{{{help}}}</small>{{/if}}
    <hr/>
  {{/with}}

  {{#with item}}
    {{> quickForm collection=formCollection id=formId type=formType doc=this}}
  {{/with}}

  <ul>
    {{#with item}}
      {{#if ct.pathTo.read}}
        <li><a href="{{pathFor route=ct.pathTo.read}}" title="{{ct.labels.linkView}}">{{ct.labels.linkView}}</a></li>
      {{/if}}
      {{#if ct.pathTo.create}}
        <li><a href="{{pathFor route=ct.pathTo.create}}" title="{{ct.labels.linkCreate}}">{{ct.labels.linkCreate}}</a></li>
      {{/if}}
    {{/with}}
    {{#if ct.pathTo.index}}
      <li><a href="{{pathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
    {{/if}}
  </ul>
</template>
```

#### Template helpers

- ``item``: the mongo document about to be updated.
- And the rest of common helpers shared by all Index+CRUD endpoints.

### CT_delete_default

The wrapper template for ``Delete`` endpoint.

```handlebars
<template name="CT_delete_default">
  <div>{{> Template.dynamic template=template }}</div>
</template>
```

#### Template helpers

- ``template``: a reactive var containing the name of the display to be rendered. You could update this display without running the route again by doing ``MyAwesomeContentType.setDisplay('index', 'new-display');``.

### CT_delete_default_default

The default display for ``Create`` endpoint.

```handlebars
<template name="CT_delete_default_default">
  {{#with meta}}
    {{#if title}}<h2>{{{title}}}</h2>{{/if}}
    {{#if summary}}<p>{{{summary}}}</p>{{/if}}
    {{#if help}}<small>{{{help}}}</small>{{/if}}
    <hr/>
  {{/with}}

  {{#with item}}
    {{ct.labels.deletePrefix}} <strong>{{title}}</strong>.<br> {{ct.labels.deleteSuffix}}
    {{#quickRemoveButton collection=formCollection _id=_id}}
      {{ct.labels.confirmOk}}
    {{/quickRemoveButton}}
  {{/with}}

  <ul>
    {{#with item}}
      {{#if ct.pathTo.read}}
        <li><a href="{{pathFor route=ct.pathTo.read}}" title="{{ct.labels.linkView}}">{{ct.labels.linkView}}</a></li>
      {{/if}}
      {{#if ct.pathTo.update}}
        <li><a href="{{pathFor route=ct.pathTo.update}}" title="{{ct.labels.linkEdit}}">{{ct.labels.linkEdit}}</a></li>
      {{/if}}
    {{/with}}
    {{#if ct.pathTo.index}}
      <li><a href="{{pathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
    {{/if}}
  </ul>
</template>
```

#### Template helpers

- ``item``: the mongo document about to be deleted.
- And the rest of common helpers shared by all Index+CRUD endpoints.





















