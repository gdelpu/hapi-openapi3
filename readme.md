# hapi-openapi3
### /!\ Work in progresss /!\ [![<gdelpu>](https://circleci.com/gh/gdelpu/hapi-openapi3.svg?style=shield)](https://app.circleci.com/pipelines/github/gdelpu/hapi-openapi3?branch=master) [![Coverage Status](https://coveralls.io/repos/github/gdelpu/hapi-openapi3/badge.svg?branch=develop)](https://coveralls.io/github/gdelpu/hapi-openapi3?branch=develop)
**hapi-openapi3** plugin implements routes in  Hapi server based on an [OpenAPI 3.0 specification](https://swagger.io/specification/), and decorate route's option with validators based on the specification itself.

The design-driven approach tends to be more efficient to build apis easier to implement & test. 
### installation
simply add the npm package to your project
npm install 
### Note:
This project was inspired by KrakenJS' hapi-openapi plugin. Great plugin, but hard to move to OpenAPI 3.0 spec
### Known limitations
- [requestBody](https://swagger.io/specification/#requestBodyObject) object's content should contain only one [mediaType](https://swagger.io/specification/#mediaTypeObject), other than the first one will be ignored.
