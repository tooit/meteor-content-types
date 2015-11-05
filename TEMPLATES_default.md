# Meteor Content Type Templates

This file shows the templates provided by the "default" theme. This could be used as a guide to know the default provided variables or to just copy+paste the base template to build your own placed on your app or custom package.

# Table of Contents

- [Introduction](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#Introduction)
- [Shared template helpers](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#shared_template_helpers)
- [Templates](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#templates)
- [CT_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_default_default)
- [CT_index_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_index_default_default)
- [CT_create_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_create_default_default)
- [CT_read_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_read_default_default)
- [CT_update_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_update_default_default)
- [CT_delete_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_delete_default_default)
- [CT_archived_default_default](https://github.com/tooit/meteor-content-types/blob/master/TEMPLATES_default.md#ct_archived_default_default)

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

### CT_default_default

The wrapper template for all the endpoints.

```handlebars
<template name="CT_default_default">
  <div>{{> UI.dynamic template=template }}</div>
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
      <li><a href="{{ctPathFor route=ct.pathTo.create}}" title="{{ct.labels.linkCreate}}">{{ct.labels.linkCreate}}</a></li>
    {{/if}}
    {{#if ctSettingEquals 'deleteType' 'soft'}}
      <li><a href="{{ctPathFor route=ct.pathTo.archive}}" title="{{ct.labels.linkArchive}}">{{ct.labels.linkArchive}}</a></li>
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
                  <a href="{{ctPathFor route=ct.pathTo.read _id=_id}}" title="{{ct.labels.linkView}}">{{ct.labels.linkView}}</a>
                {{/if}}
                {{#if ct.pathTo.update}}
                  <a href="{{ctPathFor route=ct.pathTo.update _id=_id}}" title="{{ct.labels.linkEdit}}">{{ct.labels.linkEdit}}</a>
                {{/if}}
                {{#if ctSettingEquals 'deleteType' 'soft'}}
                    <a href="" class="ct-soft-delete-btn" data-id="{{_id}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a>
                {{else}}
                  {{#if ct.pathTo.delete}}
                    <a href="{{ctPathFor route=ct.pathTo.delete _id=_id}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a>
                  {{/if}}
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

#### Template events

- ``click .ct-soft-delete-btn``: this handler will fire the soft delete action.

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
      <li><a href="{{ctPathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
    {{/if}}
  </ul>
</template>

```

#### Template helpers

- ``formCollection``: the collection associated to be used by autoform package.
- ``formId``: the form id to be used by autoform package.
- ``formType``: the form type to be used by autoform package.
- And the rest of common helpers shared by all Index+CRUD endpoints.

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
  {{/with}}


  <ul>
    {{#with item}}
      {{#if ct.pathTo.update}}
        <li><a href="{{ctPathFor route=ct.pathTo.update _id=_id}}" title="{{ct.labels.linkEdit}}">{{ct.labels.linkEdit}}</a></li>
      {{/if}}
      {{#if ctSettingEquals 'deleteType' 'soft'}}
          <li><a href="" class="ct-soft-delete-btn" data-id="{{_id}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a></li>
      {{else}}
        {{#if ct.pathTo.delete}}
          <li><a href="{{ctPathFor route=ct.pathTo.delete _id=_id}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a></li>
        {{/if}}
      {{/if}}
      {{#if ct.pathTo.index}}
        <li><a href="{{ctPathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
      {{/if}}
    {{/with}}

    {{#unless item}}
      {{#if ctSettingEquals 'deleteType' 'soft'}}
        <li><a href="" class="ct-restore-btn" data-id="{{itemId}}" title="{{ct.labels.linkRestore}}">{{ct.labels.linkRestore}}</a></li>
      {{/if}}
      {{#if ct.pathTo.index}}
        <li><a href="{{ctPathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
      {{/if}}
      {{#if ctSettingEquals 'deleteType' 'soft'}}
        <li><a href="{{ctPathFor route=ct.pathTo.archive}}" title="{{ct.labels.backToArchive}}">{{ct.labels.backToArchive}}</a></li>
      {{/if}}
    {{/unless}}
  </ul>
</template>
```

#### Template helpers

- ``item``: the mongo document about to be displayed.
- ``itemId``: the document id, usefull whe soft delete is enabled and de document is archived
- And the rest of common helpers shared by all Index+CRUD endpoints.

#### Template events

- ``click .ct-soft-delete-btn``: this handler will fire the soft delete action.
- ``click .ct-restore-btn``: this handler will fire the restore action for an archived document.

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
        <li><a href="{{ctPathFor route=ct.pathTo.read _id=_id}}" title="{{ct.labels.linkView}}">{{ct.labels.linkView}}</a></li>
      {{/if}}
      {{#if ctSettingEquals 'deleteType' 'soft'}}
          <li><a href="" class="ct-soft-delete-btn" data-id="{{_id}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a></li>
      {{else}}
        {{#if ct.pathTo.delete}}
          <li><a href="{{ctPathFor route=ct.pathTo.delete _id=_id}}" title="{{ct.labels.linkDelete}}">{{ct.labels.linkDelete}}</a></li>
        {{/if}}
      {{/if}}
      {{#if ct.pathTo.create}}
        <li><a href="{{ctPathFor route=ct.pathTo.create _id=_id}}" title="{{ct.labels.linkCreate}}">{{ct.labels.linkCreate}}</a></li>
      {{/if}}
      {{#if ct.pathTo.index}}
        <li><a href="{{ctPathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
      {{/if}}
    {{/with}}

    {{#unless item}}
      {{#if ctSettingEquals 'deleteType' 'soft'}}
        <li><a href="" class="ct-restore-btn" data-id="{{itemId}}" title="{{ct.labels.linkRestore}}">{{ct.labels.linkRestore}}</a></li>
      {{/if}}
      {{#if ct.pathTo.create}}
        <li><a href="{{ctPathFor route=ct.pathTo.create _id=_id}}" title="{{ct.labels.linkCreate}}">{{ct.labels.linkCreate}}</a></li>
      {{/if}}
      {{#if ct.pathTo.index}}
        <li><a href="{{ctPathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
      {{/if}}
      {{#if ctSettingEquals 'deleteType' 'soft'}}
        <li><a href="{{ctPathFor route=ct.pathTo.archive}}" title="{{ct.labels.backToArchive}}">{{ct.labels.backToArchive}}</a></li>
      {{/if}}
    {{/unless}}
  </ul>
</template>
```

#### Template helpers

- ``item``: the mongo document about to be updated.
- ``itemId``: the document id, usefull whe soft delete is enabled and de document is archived
- And the rest of common helpers shared by all Index+CRUD endpoints.

#### Template events

- ``click .ct-soft-delete-btn``: this handler will fire the soft delete action.
- ``click .ct-restore-btn``: this handler will fire the restore action for an archived document.

### CT_delete_default_default

The default display for ``Delete`` endpoint.

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
        <li><a href="{{ctPathFor route=ct.pathTo.read _id=_id}}" title="{{ct.labels.linkView}}">{{ct.labels.linkView}}</a></li>
      {{/if}}
      {{#if ct.pathTo.update}}
        <li><a href="{{ctPathFor route=ct.pathTo.update _id=_id}}" title="{{ct.labels.linkEdit}}">{{ct.labels.linkEdit}}</a></li>
      {{/if}}
    {{/with}}
    {{#if ct.pathTo.index}}
      <li><a href="{{ctPathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
    {{/if}}
  </ul>
</template>
```

#### Template helpers

- ``item``: the mongo document about to be deleted.
- And the rest of common helpers shared by all Index+CRUD endpoints.

### CT_archived_default_default

The default display for ``Archived`` endpoint.

```handlebars
<template name="CT_archived_default_default">
  {{#with meta}}
    {{#if title}}<h2>{{{title}}}</h2>{{/if}}
    {{#if summary}}<p>{{{summary}}}</p>{{/if}}
    {{#if help}}<small>{{{help}}}</small>{{/if}}
    <hr/>
  {{/with}}

  <ul>
    {{#if ct.pathTo.create}}
      <li><a href="{{ctPathFor route=ct.pathTo.create}}" title="{{ct.labels.linkCreate}}">{{ct.labels.linkCreate}}</a></li>
    {{/if}}
    {{#if ct.pathTo.index}}
      <li><a href="{{ctPathFor route=ct.pathTo.index}}" title="{{ct.labels.backToIndex}}">{{ct.labels.backToIndex}}</a></li>
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
                <a href="" class="ct-restore-btn" data-id="{{_id}}" title="{{ct.labels.linkRestore}}">{{ct.labels.linkRestore}}</a>
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

#### Template events

- ``click .ct-restore-btn``: this handler will fire the restore action for an archived document.
