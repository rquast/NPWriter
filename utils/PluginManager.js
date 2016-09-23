import ResourceLoader from './ResourceLoader'

class PluginManager {

    constructor(configurator) {
        this.configurator = configurator
        this.registerPluginList = new Map()
        window.registerPlugin = this.registerPlugin.bind(this)
    }

    /**
     * Fetch a list of plugins from backend and parse result to JSON
     * @returns {Promise.<TResult>|*}
     */
    getListOfPlugins() {
        return fetch('http://127.0.0.1:5000/api/plugins')
            .then(response => response.json())
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
        const pluginRegisterFunction = this.registerPluginList.get(pluginPackage.id);
        if (pluginRegisterFunction) {
            pluginRegisterFunction(pluginPackage);
        } else {
            console.info("Trying to register plugins that not exist", pluginPackage.id);
        }
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

}

export default PluginManager