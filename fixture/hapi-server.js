'use strict';

const Hapi = require('@hapi/hapi');
const Blipp = require('blipp');

const Plugin = require('../plugin');

(async () => {
    const server = Hapi.server({
        port: 2000,
        routes: {
            validate: {
                failAction: (request, h, err) => {
                    console.log(err.message);
                    request.log(['warn', 'validation', 'failAction'], {
                        error: err.message,
                        stack: err.stack
                    });
                    return err;
                }
            }
        }
    });

    await server.register([{
        plugin: Plugin,
        options: {
            api: './fixture/openapi.yaml',
            ignoreUnsupportedFields: true,
            handlers: './fixture/handlers'
        }
    }, Blipp]);

    await server.start();
})();
