module.exports = {
    coverage: true,
    'coverage-path': './lib',
    'coverage-exclude': [
        'node_modules'
    ],
    reporter: ['lcov', 'lcov', 'junit'],
    output: ['stdout',  './reports/lcov.info', './reports/tests.xml'],
    threshold: 85,
    lint: false,
    verbose: false
};
