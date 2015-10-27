 auto update -->

# Template specs

This file shows the templates provided for the "default" theme. This could be
used as a guide to use default metadata or to just copy+paste the base template
content to build your own.

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [``CT_Index_default`` (Index)](#ct_index_default-index)
- [``CT_Create_default`` (Create)](#ct_create_default-create)
- [``CT_Read_default`` (Read)](#ct_read_default-read)
- [``CT_Update_default`` (Update)](#ct_update_default-update)
- [``CT_Delete_default`` (Delete)](#ct_delete_default-delete)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## ``CT_Index_default`` (Index)

- ``items.cursor``: the query cursor from colection.find({}).
- ``items.total``: the total number of items from colection.find({}).count().
- ``ct.meta.title``: (String) the page title.
- ``ct.meta.summary``: (String) some description.
- ``ct.meta.help``: (String) some guidelines.
- ``ct.pathTo.[endpoint_key]``: (String) the name of the route for each endpoint (useful to write links dynamically using ``{{pathFor route='ct.pathTo.index'}}``).
- ``ct.fields``: (Object) array of the fields specified in the collection's schema.
- ``ct.labels``: (Object) key-value labels.

```handlebars

  <template name="CT_Index_default">
    {{#with ct.meta}}
      {{#if title}}<h2>{{{title}}}</h2>{{/if}}
      {{#if summary}}<p>{{{summary}}}</p>{{/if}}
      {{#if help}}<small>{{{help}}}</small>{{/if}}
      <hr/>
    {{/with}}

    <a href="{{pathFor route=ct.pathTo.create}}" title="{{ct.labels.linkCreate}}">{{ct.labels.linkCreate}}</a>

    <hr>

    {{#with items}}
      {{#if items.total}}
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
                  <a href="{{pathFor route=ct.pathTo.read}}" title="{{ct.labels.linkView}}">{{ct.labels.linkView}}</a>
                  <a href="{{pathFor route=ct.pathTo.update}}" title="{{ct.labels.linkEdit}}">{{ct.labels.linkEdit}}</a>
                  <a href="{{pathFor route=ct.pathTo.delete}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a>
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
        <p>{{ct.labels.totalItemsPrefix}} <strong>{{items.total}}</strong> {{ct.labels.totalItemsSuffix}}</p>
      {{else}}
        <p>{{ct.labels.noItemsFound}}</p>
      {{/if}}
    {{/with}}
  </template>

```

## ``CT_Create_default`` (Create)

- ``formCollection``: the collection associated to be used by autoform package.
- ``formId``: the form id to be used by autoform package.
- ``formType``: the form type to be used by autoform package.
- ``ct.meta.title``: (String) the page title.
- ``ct.meta.summary``: (String) some description.
- ``ct.meta.help``: (String) some guidelines.
- ``ct.pathTo.[endpoint_key]``: (String) the name of the route for each endpoint (useful to write links dynamically using ``{{pathFor route='ct.pathTo.index'}}``).
- ``ct.fields``: (Object) array of the fields specified in the collection's schema.
- ``ct.labels``: (Object) key-value labels.

```handlebars

  <template name="CT_Create_default">
    {{#with ct.meta}}
      {{#if title}}<h2>{{{title}}}</h2>{{/if}}
      {{#if summary}}<p>{{{summary}}}</p>{{/if}}
      {{#if help}}<small>{{{help}}}</small>{{/if}}
      <hr/>
    {{/with}}

    {{> quickForm collection=formCollection id=formId type=formType}}

    <hr>

    <a href="{{pathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a>
  </template>

```

## ``CT_Read_default`` (Read)

- ``ct.meta.title``: (String) the page title.
- ``ct.meta.summary``: (String) some description.
- ``ct.meta.help``: (String) some guidelines.
- ``ct.pathTo.[endpoint_key]``: (String) the name of the route for each endpoint (useful to write links dynamically using ``{{pathFor route='ct.pathTo.index'}}``).
- ``ct.fields``: (Object) array of the fields specified in the collection's schema.
- ``ct.labels``: (Object) key-value labels.

```handlebars

  <template name="CT_Read_default">
    {{#with ct.meta}}
      {{#if title}}<h2>{{{title}}}</h2>{{/if}}
      {{#if summary}}<p>{{{summary}}}</p>{{/if}}
      {{#if help}}<small>{{{help}}}</small>{{/if}}
      <hr/>
    {{/with}}

    {{#with item}}
      <table border="1">
        <thead>
          <tr>
            <td>Key</td>
            <td>Label</td>
            <td>Value</td>
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

      <hr>

      <a href="{{pathFor route=ct.pathTo.update}}" title="{{ct.labels.linkEdit}}">{{ct.labels.linkEdit}}</a>
      &nbsp;|&nbsp;
      <a href="{{pathFor route=ct.pathTo.delete}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a>
      &nbsp;|&nbsp;
      <a href="{{pathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a>
    {{/with}}
  </template>

```

## ``CT_Update_default`` (Update)

- ``ct.meta.title``: (String) the page title.
- ``ct.meta.summary``: (String) some description.
- ``ct.meta.help``: (String) some guidelines.
- ``ct.pathTo.[endpoint_key]``: (String) the name of the route for each endpoint (useful to write links dynamically using ``{{pathFor route='ct.pathTo.index'}}``).
- ``ct.fields``: (Object) array of the fields specified in the collection's schema.
- ``ct.labels``: (Object) key-value labels.

```handlebars

  <template name="CT_Update_default">
    {{#with ct.meta}}
      {{#if title}}<h2>{{{title}}}</h2>{{/if}}
      {{#if summary}}<p>{{{summary}}}</p>{{/if}}
      {{#if help}}<small>{{{help}}}</small>{{/if}}
      <hr/>
    {{/with}}

    {{#with item}}
      {{> quickForm collection=formCollection id=formId type=formType doc=this}}

      <hr>

      <a href="{{pathFor route=ct.pathTo.read}}" title="{{ct.labels.linkView}}">{{ct.labels.linkView}}</a>
      &nbsp;|&nbsp;
      <a href="{{pathFor route=ct.pathTo.create}}" title="{{ct.labels.linkCreate}}">{{ct.labels.linkCreate}}</a>
      &nbsp;|&nbsp;
      <a href="{{pathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a>
    {{/with}}
  </template>

```

## ``CT_Delete_default`` (Delete)

- ``ct.meta.title``: (String) the page title.
- ``ct.meta.summary``: (String) some description.
- ``ct.meta.help``: (String) some guidelines.
- ``ct.pathTo.[endpoint_key]``: (String) the name of the route for each endpoint (useful to write links dynamically using ``{{pathFor route='ct.pathTo.index'}}``).
- ``ct.fields``: (Object) array of the fields specified in the collection's schema.
- ``ct.labels``: (Object) key-value labels.

```handlebars

<template name="CT_Delete_default">
  {{#with ct.meta}}
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

  {{#if item}}
    <hr>

    <a href="{{pathFor route=ct.pathTo.read}}" title="{{ct.labels.linkView}}">{{ct.labels.backToDocument}}</a>
    &nbsp;|&nbsp;
    <a href="{{pathFor route=ct.pathTo.update}}" title="{{ct.labels.linkEdit}}">{{ct.labels.linkEdit}}</a>
    &nbsp;|&nbsp;
  {{/if}}
  <a href="{{pathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a>
</template>

```
