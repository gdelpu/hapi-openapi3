const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Hapi = require('@hapi/hapi');
const Boom = require('@hapi/boom');

const Plugin = require('../plugin');

const { expect } = Code;
const { describe, it, before } = exports.lab = Lab.script();

const initServer = async () => {

        const server = Hapi.server({
            port: 2000,
            routes: {
                validate: {
                    failAction: (request, h, err) => {
                        return err;
                    }
                }
            }
        });

        await server.register([{
            plugin: Plugin,
            options: {
                api: './fixture/openapi.yaml',
                ignoreUnsupportedFields: true
            }
        }]);

        return server;
    }
;

describe('Hapi-openapi3', () => {

    let server;

    before(async () => {

        server = await initServer();
    });

    it('Should create routes', () => {

        expect(server.table()).to.have.length(10);
    });

    it('Should use summary as route description', () => {

        expect(server.table()[0].settings.description).to.endWith('test route');
    });

    describe('validators', () => {
        const QUERY_URL = '/query';
        const PATH_URL = '/path';
        const PAYLOAD_URL = '/payload';
        const INTEGER_URL = '/integer';
        const NUMBER_URL = '/number';
        const STRING_URL = '/string';
        const BOOLEAN_URL = '/boolean';
        const ARRAY_URL = '/array';
        const DATE_URL = '/date';

        describe('Parameter types', () => {
            it('should handle query parameters', async () => {

                let { result } = await server.inject({ method: 'get', url: QUERY_URL });
                expect(result.validation.keys).to.include('id');
            });

            it('should handle path parameters', async () => {

                let { result } = await server.inject({ method: 'get', url: `${PATH_URL}/a` });
                expect(result.validation.keys).to.include('id');
            });

            it('should handle payload parameters', async () => {

                let { result } = await server.inject({ method: 'post', url: PAYLOAD_URL, payload: { propInt: 'a' } });
                expect(result.validation.keys).to.include('propRequired');

            });
        });

        describe('Integer', () => {

            it('should handle multipleOf field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: INTEGER_URL,
                    payload: { propIntegerMultiple: 1 }
                });
                expect(result.validation.keys).to.include('propIntegerMultiple');
            });

            it('should handle minimum field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: INTEGER_URL,
                    payload: { propIntegerMin: 1 }
                });
                expect(result.validation.keys).to.include('propIntegerMin');
            });

            it('should handle exclusiveMinimum field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: INTEGER_URL,
                    payload: { propIntegerMinExclusive: 2 }
                });
                expect(result.validation.keys).to.include('propIntegerMinExclusive');
            });

            it('should handle maximum field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: INTEGER_URL,
                    payload: { propIntegerMax: 3 }
                });
                expect(result.validation.keys).to.include('propIntegerMax');
            });

            it('should handle exclusiveMaximum field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: INTEGER_URL,
                    payload: { propIntegerMaxExclusive: 2 }
                });
                expect(result.validation.keys).to.include('propIntegerMaxExclusive');
            });

            it('should handle integer type', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: INTEGER_URL,
                    payload: { propInteger: 'a' }
                });
                expect(result.validation.keys).to.include('propInteger');
            });
        });

        describe('Number', () => {

            it('should handle number type', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: NUMBER_URL,
                    payload: { propRequired: true, propNumber: 'a' }
                });
                expect(result.validation.keys).to.include('propNumber');
            });

            it('should handle multipleOf field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: NUMBER_URL,
                    payload: { propIntegerMultiple: 2.3 }
                });
                expect(result.validation.keys).to.include('propIntegerMultiple');
            });

            it('should handle minimum field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: NUMBER_URL,
                    payload: { propIntegerMin: 1.9 }
                });
                expect(result.validation.keys).to.include('propIntegerMin');
            });

            it('should handle exclusiveMinimum field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: NUMBER_URL,
                    payload: { propIntegerMinExclusive: 2.0 }
                });
                expect(result.validation.keys).to.include('propIntegerMinExclusive');
            });

            it('should handle maximum field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: NUMBER_URL,
                    payload: { propIntegerMax: 2.1 }
                });
                expect(result.validation.keys).to.include('propIntegerMax');
            });

            it('should handle exclusiveMaximum field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: NUMBER_URL,
                    payload: { propIntegerMaxExclusive: 2.0 }
                });
                expect(result.validation.keys).to.include('propIntegerMaxExclusive');
            });
        });

        describe('String', () => {

            it('should handle string type', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: STRING_URL,
                    payload: { propString: 123 }
                });
                expect(result.validation.keys).to.include('propString');
            });

            it('should handle maximumLength field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: STRING_URL,
                    payload: { propStringMax: 'AAA' }
                });
                expect(result.validation.keys).to.include('propStringMax');
            });

            it('should handle minimumLength field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: STRING_URL,
                    payload: { propStringMin: 'A' }
                });
                expect(result.validation.keys).to.include('propStringMin');
            });

            it('should handle pattern field', async () => {
                //Maximum length
                const { result } = await server.inject({
                    method: 'post',
                    url: STRING_URL,
                    payload: { propStringPattern: 'AAA_AA' }
                });
                expect(result.validation.keys).to.include('propStringPattern');
            });

            describe('format: Date', () => {

                it('should handle format field = date', async () => {

                    const {result} = await server.inject({
                        method: 'post',
                        url: DATE_URL,
                        payload: { propDate: 'this is not a date' }
                    });
                    expect(result.validation.keys).to.include('propDate');
                });

            });
        });

        describe('Boolean', () => {

            it('should handle boolean parameters', async () => {
                const { result } = await server.inject({
                    method: 'post',
                    url: BOOLEAN_URL,
                    payload: { propBoolean: 1.123 }
                });
                expect(result.validation.keys).to.include('propBoolean');
            });
        });

        describe('Array', () => {

            it('should handle array type', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: ARRAY_URL,
                    payload: { propArray: [1, 'A'] }
                });
                expect(result.validation.keys).to.include('propArray.1');
            });

            it('should handle uniqueItems field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: ARRAY_URL,
                    payload: { propArrayUnique: [1, 1] }
                });
                expect(result.validation.keys).to.include('propArrayUnique.1');
            });

            it('should handle minItems field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: ARRAY_URL,
                    payload: { propArrayMin: [1, 2] }
                });
                expect(result.validation.keys).to.include('propArrayMin');
            });

            it('should handle maxItems field', async () => {

                const { result } = await server.inject({
                    method: 'post',
                    url: ARRAY_URL,
                    payload: { propArrayMax: [1, 2, 3, 4] }
                });
                expect(result.validation.keys).to.include('propArrayMax');
            });
        });
        /*




                                */
    });
});

