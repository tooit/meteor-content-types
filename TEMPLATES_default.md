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

## ``CT_Create_default`` (Create)

- ``title``: the page title.
- ``summary``: some description.
- ``help``: some guidelines.

```handlebars

  <template name="CT_Create_default">
    {{#with ct.meta}}
      {{#if title}}<h2>{{{title}}}</h2>{{/if}}
      {{#if summary}}<p>{{{summary}}}</p>{{/if}}
      {{#if help}}<small>{{{help}}}</small>{{/if}}
      <hr/>
    {{/with}}

    {{> quickForm collection=formCollection id=formId type=formType}}
  </template>

```

## ``CT_Read_default`` (Read)

## ``CT_Update_default`` (Update)

## ``CT_Delete_default`` (Delete)
