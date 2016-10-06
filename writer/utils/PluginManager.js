import ResourceLoader from './ResourceLoader'
import isString from 'lodash/isString'
import 'whatwg-fetch'

class PluginManager {

    constructor(configurator) {
        this.configurator = configurator
        this.registerPluginList = new Map()
        this.plugins = new Map()
        this.configurationCache = {};

        window.writer = {}
        window.writer.registerPlugin = this.registerPlugin.bind(this)
    }

    /**
     * Fetch a list of plugins from backend and parse result to JSON
     * @param configURL {string} A URL to the config file containt plugins
     * @returns {Promise.<TResult>|*}
     */
    getListOfPlugins(configURL) {
        return fetch(configURL)
            .then(response => response.json())
            .then(configJson => configJson.plugins)
    }

    /**
     * Appending script tag for plugins
     * @param plugins
     * @returns {[{Promise.<TResult>|*}]}
     */
    appendPluginScripts(plugins) {
        const resourceLoader = new ResourceLoader()
        return plugins.map(plugin => {
            return resourceLoader.load(plugin, 'js')
        })
    }


    /**
     * Called by the plugin when it's done loaded.
     * @param pluginPackage
     */
    registerPlugin(pluginPackage) {
        if (!this.validatePluginPackage(pluginPackage)) {
            throw new Error('Package does not conform to package standard')
        }
        const pluginRegisterFunction = this.registerPluginList.get(pluginPackage.id);
        if (pluginRegisterFunction) {
            pluginRegisterFunction(pluginPackage);
        }
    }

    /**
     * Checks if requires properties and methods exists on pluginPackage
     * @param pluginPackage
     * @returns {boolean}
     */
    validatePluginPackage(pluginPackage) {
        return !(typeof pluginPackage.configure !== 'function' || !pluginPackage.id || !pluginPackage.name || !pluginPackage.configure);
    }

    /**
     * Adding a register function for plugins. That's called later in registerPlugin method in the window object
     * @param plugins
     * @returns {Promise.<*>}
     */
    load(plugins) {
        const pluginRegistered = plugins.map(plugin => {
            return new Promise((resolve, reject) => {

                let resolved = false;

                this.registerPluginList.set(plugin.id, (pluginPackage) => {
                    this.configurator.import(pluginPackage)
                    resolved = true;
                    this.plugins.set(plugin.id, plugin)
                    this.registerPluginList.delete(plugin.id)
                    resolve();
                })

                setTimeout(() => {
                    if (!resolved) {
                        reject(plugin.id + " did not respond in time");
                    }
                }, 10000)
            })
        })

        const pluginsAppendPromise = this.appendPluginScripts(plugins)
        const allPromises = [...pluginsAppendPromise, ...pluginRegistered]
        return Promise.all(allPromises)
    }


    getConfigValue(obj, path, defaultValue) {

        var namePath,
            name,
            config = null;

        if (isString(obj)) {
            name = obj;
            namePath = name + '.data.' + path;
        }
        else if (obj.schema && obj.schema.name) {
            name = obj.schema.name;
            namePath = name + '.data.' + path;
            config = obj.config;
        }
        else {
            throw new Error('Either string or plugin object with config is mandatory to get config value');
        }

        // If no config object is give and not cached, then fetch value
        if (config === null || false === namePath in this.configurationCache) {
            return this._getValue(name, namePath, path, defaultValue, config);
        }

        return this.configurationCache[namePath];
    }

    /**
     * Get and cache requested config path from within plugins data section
     * @protected
     *
     * @param type Plugin name
     * @param typePath Fake path with type used to cache value
     * @param path JSON path to get
     * @param defaultValue Optional, default value to return if not set
     * @param If not null, config structure to use instead of plugin config array
     */
    _getValue(name, namePath, path, defaultValue, config) {
        var ptr = this.plugins;
        var keys = path.split('.');
        var value = 'undefined' === typeof(defaultValue) ? undefined : defaultValue;

        if (config) {
            ptr = config;
        }
        else {

            let pluginData = this.plugins.get(name)
            if(pluginData) {
                ptr = pluginData.data
                // console.log("", pluginData.data[path]);
            }
            // for (var i = 0; i < ptr.length; i++) {
            //     if (ptr[i].name === name) {
            //         ptr = ptr[i].data;
            //         break;
            //     }
            // }
        }

        if (!ptr) {
            return defaultValue;
        }

        defaultValue = value;
        for (var n = 0; n < keys.length; n++) {
            if (typeof(ptr[keys[n]]) === "undefined") {
                value = defaultValue;
                break;
            }

            value = ptr[keys[n]];
            ptr = ptr[keys[n]];
        }

        if (config === null) {
            this.configurationCache[namePath] = value;
        }

        return value;
    }

}

export default PluginManager