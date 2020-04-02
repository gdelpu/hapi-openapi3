'use strict';

const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const SwaggerParser = require('@apidevtools/swagger-parser');

const { setDescription } = require('./routeUtilities');
const { createValidators } = require('./validators');
const { getHandler } = require('./handlers');

const optionsSchema = Joi.object({
    api: Joi.string().required(),
    handlers: Joi.string().required(),
    ignoreUnsupportedFields: Joi.boolean(),
    basedir: Joi.string()
}).required();

/**
 *
 * @param spec
 * @param server
 */
const createApiRoutes = (spec, server, handlersPath) => {

    for (const routeEntry of Object.entries(spec.paths)) {

        const path = routeEntry[0];
        //Iterate on route's methods
        for (const methodEntry of Object.entries(routeEntry[1])) {
            const handler = getHandler(methodEntry[0], path, handlersPath);
            if (handler) {
                let route = {
                    method: methodEntry[0],
                    path: path,
                    handler
                };

                route = setDescription(route, methodEntry[1]);
                route = createValidators(route, methodEntry[1]);

                server.route(route);
            }
        }
    }
};

exports.plugin = {
    pkg: require('../package.json'),
    register: async function (server, options) {

        try {
            Joi.assert(options, optionsSchema, { abortEarly: false });
        } catch (e) {
            //todo: Recreate a relevant error based on validation result.
            throw Boom.boomify(e);
        }

        const spec = await SwaggerParser.validate(options.api);
        server.validator(Joi);

        createApiRoutes(spec, server, options.handlers);
        //TODO: Create spec route
    }
};
