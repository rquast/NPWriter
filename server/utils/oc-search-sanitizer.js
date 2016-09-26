'use strict';

var sanitize = function(query) {

    var invalidCharacters = {
        '(': true,
        ')': true,
        '&': true,
        '+': true,
        '"': true,
        "'": true,
        ':': true,
        '=': true,
        '[': true,
        ']': true
    };

    var sanitizedQuery = "";

    for (let c of query) {
        if(!invalidCharacters[c]) {
            sanitizedQuery += c;
        }
    }

    return sanitizedQuery;
};

module.exports = sanitize;

