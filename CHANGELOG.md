# v0.0.8

- allow to setup new endpoints
- implemented content type initialization on demand (router before action)
- merged default endpoint template wrapper (now, all wrappers uses the template CT_default_default at _wrapper.html)
- added better error message with template suggestions when adding new endpoints without specifing a default display
- updated documentation for README.md
- updated source code comments
- replaced underscore checks by Match.test

# v0.0.7

- added support for hooks onCreated, onDestroyed and onRendered hooks for Display Template
- updated documentation for README.md

# v0.0.6

- added display feature (https://trello.com/c/kkiPiZXY)
- provided default displays per endpoint
- added custom template fallback for endpoint displays
- removed harcoded metadata
- updated Index+CRUD templates to support displays
- support default template override
- added shared package settings under ContentTypes object
- added eventMaps to Displays
- updated package description
- updated documentation for TEMPLATE_default.md
- updated documentation for README.md
- added this CHANGELOG.md file

# v0.0.5

- updated package github url from ssh to https
- updated toc structure at README.md
- fixed minor bugs and browser console warnings

# v0.0.4

- added support for enable and disable endpoints
- added label abstraction layer and fixed template helpers for index, read, update and delete endpoints

# v0.0.3

- updated README.md with metadata documentation and added TEMPLATES_default.md to provide default documentation for theme default templates
- Added base package functionality. Iron router automatically creates Index+CRUD routes. Default theme for create endpoint

# v0.0.2

- added default templates with harcoded metadata
- added documentation at README.md

# v0.0.1

- initial commit
- created package.js with specified dependencies
- base object definition
