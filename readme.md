# hapi-openapi3
**hapi-openapi3** plugin implements routes in  Hapi server based on an [OpenAPI 3.0 specification](https://swagger.io/specification/), and decorate route's option with validators based on the specification itself.

The design-driven approach tends to be more efficient to build apis easier to implement & test. 
### installation
simply add the npm package to your project
npm install 
### Note:
This project was inspired by KrakenJS' hapi-openapi plugin. Great plugin, but hard to move to OpenAPI 3.0 spec
### Known limitations
- [requestBody](https://swagger.io/specification/#requestBodyObject) object's content should contain only one [mediaType](https://swagger.io/specification/#mediaTypeObject), other than the first one will be ignored.
