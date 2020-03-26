'use strict';

const Fs = require('fs');
const Path = require('path');
const ObjectFiles = require('merge-object-files');

const getHandler = (method, url, path) => {

    const modulePath = Path.join(process.cwd(), path, url);
    if (Fs.existsSync(`${modulePath}.js`)){
        const handler = require(`${modulePath}`);
        return handler[method];
    } else {
        return null;
    }
};

module.exports = {
    getHandler
};
