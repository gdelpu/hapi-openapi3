'use strict';

/**
 *
 * @param route
 * @param path
 * @returns {*}
 */
const prepareRouteOptions = (route, path) => {
    const pathSegment = path.split('.');

    if (!route.hasOwnProperty(pathSegment[0])) {
        route[pathSegment[0]] = {};
    }

    let tempObject = route[pathSegment[0]];
    for (let index = 1; index < pathSegment.length; index++) {
        if (!tempObject.hasOwnProperty(pathSegment[index])) {
            tempObject[pathSegment[index]] = {};
            //Object.defineProperty(tempObject, pathSegment[index], { value: {}, writable: true });
        }
        tempObject = tempObject[pathSegment[index]];
    }

    return route;
};

/**
 *
 * @param route
 * @param routeEntry
 * @returns {{options}|*}
 */
const setDescription = (route, routeEntry) => {

    if (routeEntry.hasOwnProperty('summary')) {
        route = prepareRouteOptions(route, 'options');

        route.options.description = routeEntry.summary;
    }

    return route;
};

module.exports = {
    prepareRouteOptions,
    setDescription
};
