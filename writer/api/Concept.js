'use strict';

import {isArray} from 'lodash'
import {isObject} from 'lodash/isObject'
import {find} from 'lodash/find'
import {clone} from 'lodash/clone'

// TODO Add tests
/**
 * High-level functions for working with Concepts.
 */
class Concept {

    /**
     * Search in definition to find specified type'
     *
     * @param {*} definition An array or object
     * @param {string} type The type to search for, drol:short, drol:long
     * @returns {*} Return either the definition object or undefined if not found
     */
    static getDefinitionForType(definition, type) {

        if (!definition) {
            return undefined;
        }
        if (isArray(definition)) {
            return find(definition, function (def) {
                return def['@role'] === type;
            });
        } else if (isObject(definition)) {
            return definition['@role'] === type ? definition : undefined;
        }

    }


    /**
     * Set definition depending on previous definition is an object or array
     * @param {*} definition An array or object
     * @param {object} description object
     */
    static setDefinitionDependingOnArrayOrObject = function (definition, description) {

        if (isArray(definition)) {
            definition.push(description);
            return definition;
        } else {
            var existingDescription = clone(definition);
            definition = [];
            definition.push(existingDescription);
            definition.push(description);
            return definition;
        }
    }

}

export default Concept
