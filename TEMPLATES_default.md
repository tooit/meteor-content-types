# Template specs

This file shows the templates provided for the "default" theme. This could be
used as a guide to use default metadata or to just copy+paste the base template
content to build your own.

## Index


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

## Read
## Update
## Delete
