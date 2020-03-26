'use strict';

const Joi = require('@hapi/joi');

const { prepareRouteOptions } = require('./routeUtilities');
/**
 *
 * @param param
 */
const assertParamFieldsAreSupported = (param) => {

    if (param.style) {
        throw Boom.notImplemented('Field "style" not supported in parameter');
    }
    if (param.explode) {
        throw Boom.notImplemented('Field "explode" not supported in parameter');
    }
    if (param.allowReserved) {
        throw Boom.notImplemented('Field "allowReserved" not supported in parameter');
    }
    if (param.content) {
        throw Boom.notImplemented('Field "content" not supported in parameter');
    }
};

/**
 *
 * @param schema
 */
const assertSchemaFieldsAreSupported = (schema) => {

    if (schema.allOf) {
        throw Boom.notImplemented('Field "allOf" not supported in parameter');
    }
    if (schema.oneOf) {
        throw Boom.notImplemented('Field "oneOf" not supported in parameter');
    }
    if (schema.anyOf) {
        throw Boom.notImplemented('Field "anyOf" not supported in parameter');
    }
    if (schema.not) {
        throw Boom.notImplemented('Field "not" not supported in parameter');
    }
    if (schema.additionalProperties) {
        throw Boom.notImplemented('Field "additionalProperties" not supported in parameter');
    }
    if (schema.additionalProperties) {
        throw Boom.notImplemented('Field "additionalProperties" not supported in parameter');
    }
};


/**
 *
 * @param schema
 * @returns {*}
 */
const createJoiNumberSchemaFromObjectSchema = function (schema) {

    let joiSchema = Joi.number();

    if (schema.type === 'integer') {
        joiSchema = joiSchema.integer();
    }

    if (schema.multipleOf) {
        joiSchema = joiSchema.multiple(schema.multipleOf);
    }

    if (schema.maximum) {
        if (schema.exclusiveMaximum) {
            joiSchema = joiSchema.less(schema.maximum);
        } else {
            joiSchema = joiSchema.max(schema.maximum);
        }
    }

    if (schema.minimum) {
        if (schema.exclusiveMinimum) {
            joiSchema = joiSchema.greater(schema.minimum);
        } else {
            joiSchema = joiSchema.min(schema.minimum);
        }
    }
    return joiSchema;
};

/**
 *
 * @param schema
 * @returns {*}
 */
const createJoiStringSchemaFromObjectSchema = (schema) => {

    let joiSchema;
    if (schema.hasOwnProperty('format')) {
        switch (schema.format) {
            case 'byte':
                joiSchema = Joi.binary().encoding('base64');
                break;
            case 'binary':
                joiSchema = Joi.binary();
                break;
            case 'date-time':
            case 'date':
                joiSchema = Joi.date();
                break;
            default:
                throw Boom.notImplemented(`Unknown format ${schema.format}`);
        }
    } else {
        joiSchema = Joi.string();
    }

    if (schema.maxLength) {
        joiSchema = joiSchema.max(schema.maxLength);
    }

    if (schema.minLength) {
        joiSchema = joiSchema.min(schema.minLength);
    }

    if (schema.pattern) {
        joiSchema = joiSchema.pattern(new RegExp(schema.pattern));
    }
    return joiSchema;
};

/**
 *
 * @param schema
 * @returns {this | *}
 */
const createJoiArraySchemaFromObjectSchema = (schema) => {

    const itemJoiSchema = processSchemaObject(schema.items);
    let resultSchema = Joi.array().items(itemJoiSchema);

    // Handle minItems property
    resultSchema = schema.minItems ? resultSchema.min(schema.minItems) : resultSchema;
    // Handle maxItems property
    resultSchema = schema.maxItems ? resultSchema.max(schema.maxItems) : resultSchema;
    // handle uniqueItems property
    resultSchema = schema.uniqueItems ? resultSchema.unique() : resultSchema;

    return resultSchema
};

/**
 *
 * @param schema
 * @returns {*}
 */
const createJoiObjectSchemaFromObjectSchema = (schema) => {

    const entries = {};
    for (const property of Object.entries(schema.properties)) {
        let joiSchema = processSchemaObject(property[1]);

        if (schema.required && schema.required.includes(property[0])) {
            joiSchema = joiSchema.required();
        }
        entries[property[0]] = joiSchema;
    }
    return Joi.object(entries);
};

/**
 * Process a schema object, as defined [here](https://swagger.io/specification/#schemaObject)
 * and returns the corresponding Joi schema
 * @param schema Schema object
 * @returns {schema} Joi schema
 */
const processSchemaObject = (schema) => {

    let joiSchema = null;

    assertSchemaFieldsAreSupported(schema);
    // Process Schema
    switch (schema.type) {
        case 'integer':
            joiSchema = createJoiNumberSchemaFromObjectSchema(schema);
            break;
        case 'number':
            joiSchema = createJoiNumberSchemaFromObjectSchema(schema);
            break;
        case 'string':
            joiSchema = createJoiStringSchemaFromObjectSchema(schema);
            break;
        case 'boolean':
            joiSchema = Joi.boolean();
            break;
        case 'array':
            joiSchema = createJoiArraySchemaFromObjectSchema(schema);
            break;
        case 'object':
            joiSchema = createJoiObjectSchemaFromObjectSchema(schema);
            break;
        default:
            throw Boom.notImplemented(`Parameter type "${schema.type}" is not supported`);
    }

    if (schema.default) {
        joiSchema = joiSchema.default(schema.default);
    }
    return joiSchema;
};

/**
 *
 * @param param
 * @returns {schema}
 */
const processContentObject = (param) => {

    // Get the Media Type Object of the first item in "content"
    const mediaTypeObject = Object.entries(param)[0][1];
    return processSchemaObject(mediaTypeObject.schema);
};

/**
 * Process a single parameter and return corresponding Joi schema
 * @param param
 * @returns {schema} Joi schema
 */
const ProcessParamObject = (param) => {

    let joiSchema = null;
    //Schema vs Content (Cf. https://swagger.io/docs/specification/describing-parameters/)
    if (param.schema) {
        joiSchema = processSchemaObject(param.schema);
    } else if (param.content) {
        // Process Content
        joiSchema = processContentObject(param.content);
    }

    if ((param.required || param.in === 'path') && joiSchema) {
        joiSchema = joiSchema.required();
    }
    return joiSchema;
};

/**
 * Decorate a route with Joi validators for its:
 * - Query parameters
 * - Path parameters
 * - Payload
 * @param route
 * @param methodEntry
 * @returns {Route} the Hapi route object with options.validate
 */
const createValidators = (route, methodEntry) => {

    if (methodEntry.hasOwnProperty('parameters')) {
        for (const parameter of methodEntry.parameters) {

            try {
                assertParamFieldsAreSupported(parameter);
            } catch (e) {
                //Todo: handle options.ignoreUnsupportedFields
            }

            const schema = ProcessParamObject(parameter);

            switch (parameter.in) {
                case 'query':
                    route = prepareRouteOptions(route, 'options.validate.query');
                    route.options.validate.query[parameter.name] = schema;
                    break;
                case 'path':
                    route = prepareRouteOptions(route, 'options.validate.params');
                    route.options.validate.params[parameter.name] = schema;
                    break;
                default:
                    throw Boom.notImplemented('Parameter type unsupported');
            }
        }
    }

    if (methodEntry.hasOwnProperty('requestBody')) {
        // Create the Joi validator
        route = prepareRouteOptions(route, 'options.validate.payload');
        route.options.validate.payload = ProcessParamObject(methodEntry.requestBody);
    }

    //todo: Validate cookies
    //todo: Validate headers
    return route;
};

module.exports = {
    createValidators
};
