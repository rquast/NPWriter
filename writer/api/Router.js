import 'whatwg-fetch'
import isObject from 'lodash/isObject'
/**
 * @class Api.Router
 *
 * Router api class with functions for communication with the backend.
 * All router functions are available through the context.api.router object.
 */
class Router {

    /**
     * Post a binary file object to the backend
     *
     * @param {string} path
     * @param {object} file File object from file input or file drop
     * @param {Function} onProgress Callback function for progress event
     * @param {Function} onLoad Callback function for onload event
     */
    postBinary(path, file, onProgress, onLoad, onError) {
        var xhr = new XMLHttpRequest(); //jshint ignore:line

        xhr.onload = onLoad;
        xhr.onError = onError;
        xhr.addEventListener('progress', onProgress);

        xhr.open('POST', path, true);

        xhr.setRequestHeader("content-type", file.type);
        xhr.setRequestHeader("x-filename", encodeURIComponent(file.name));
        xhr.send(file);
    }

    /**
     * Post data to specified backend endpoint
     *
     * @param {string} path
     * @param {object} parameters
     *
     * @return {object} jQuery ajax object
     */
    post(path, parameters) {
        return this.ajax('POST', 'text', path, null, parameters);
    }

    /**
     * Put data to specified backend endpoint
     *
     * @param {string} path
     * @param {object} parameters
     *
     * @return {object} jQuery ajax object
     */
    put(path, parameters) {
        return this.ajax('PUT', 'text', path, null, parameters);
    }

    /**
     * Get data from specified backend endpoint
     *
     * @param {string} path
     * @param {object} parameters
     *
     * @return {object} jQuery ajax object
     *
     * @example
     * this.context.api.router.get('/api/image/url/' + uuid)
     *     .done(function (url) {
 *         // Handle url
 *     }.bind(this))
     *     .error(function (error, xhr, text) {
 *         console.error(error, xhr, text);
 *     }.bind(this));
     */
    get(path, parameters) {

        let url = this.getEndpoint() + path,
            query = []

        if (isObject(parameters)) {
            for (name in parameters) {
                query.push(name + '=' + encodeURI(parameters[name]));
            }

            url += '?' + query.join('&');
        }

        return fetch(url, {
            method: 'GET'
        })

        // return this.ajax('GET', 'text', path, parameters);
    }

    /**
     * Return api backend url
     * @todo Specify api endpoint in config file
     *
     * @return {string}
     */
    getEndpoint() {
        var location = window.location;
        return location.protocol + "//" + location.hostname + ":" + location.port;
    }

    /**
     * Execute ajax call to backend
     *
     * @param {string} method (GET, PUT, POST, DELETE)
     * @param {string} dataType (text, xml, json, script)
     * @param {string} path
     * @param {object} parameters
     * @param {object} data
     *
     * @return {object} jQuery ajax object
     */
    ajax(method, dataType, path, parameters, data) {
        var url = this.getEndpoint(),
            name,
            query = [];

        if (typeof(path) !== 'undefined') {
            url += path;
        }

        if (isObject(parameters)) {
            for (name in parameters) {
                query.push(name + '=' + encodeURI(parameters[name]));
            }

            url += '?' + query.join('&');
        }


        if (isObject(data)) {
            console.warn("Data should now be object anymore");
        }


        // TODO + (plus) chars is stripped from dates

        var sendData = {
            method: method,
            dataType: dataType,
            url: url,
            headers: {
                "Content-Type": "application/xml"
            }
        };

        if (data) {
            // sendData['data'] = data;
            sendData['body'] = data
        }

        console.log("SendData", sendData);

        return fetch(url, sendData)
    }

    /**
     * Proxy ajax call to external backend
     *
     * @param {string} path
     * @param {object} op
     *
     * @return {object} jQuery ajax object
     */
    proxy(path, op) {
        var url = this.getEndpoint();

        if (typeof(path) !== 'undefined') {
            url += path;
        }

        return $.ajax({
            method: 'post',
            dataType: 'text',
            url: url,
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(op)
        });
    }


    /**
     * Method checks for a status code between 200 and 299
     * Throws error if otherwise.
     *
     * Use for example when you want to reject a fetch promise
     *
     * * @example
     * fetch(...)
     *  .then(response => checkForOKStatus(response)
     *  .then(response => toJson(response)
     *  .then(json => ...)
     *  .catch((error) => {
     *
     *  }
     *
     *
     * @param response
     * @returns {*}
     */
    checkForOKStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response
        } else {
            console.log("Not OK status: " + response.status)
            return new Promise((resolve, reject) => {
                response.text()
                    .then(text => {
                        if (text.startsWith("{")) {
                            try {
                                reject(JSON.parse(text))
                            } catch (e) {
                                console.log("Unparseable json in error message")
                                reject(text)
                            }
                        } else {
                            return (reject(text));
                        }
                    })
                    .then(message => reject(message))
                    .catch(e => reject(response.statusText))
            })
        }
    }


    /**
     * Tries to convert response to json and logs the result to console if it fails and throws
     * original exception.
     *
     *
     * @param response The response to convert to Json
     * @return {*}
     */
    toJson(response) {
        return new Promise((resolve, reject) => {
            response.json()
                .then(json => resolve(json))
                .catch(e => {
                        response.text()
                            .then(text => {
                                console.log(text)
                                return text
                            })
                            .then(reject(e))
                            .catch(e2 => reject(e))
                    }
                )
        })
    }
}

export default Router
