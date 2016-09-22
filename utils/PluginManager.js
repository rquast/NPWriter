import ResourceLoader from './ResourceLoader'

class PluginManager {

    load() {
        return fetch('http://127.0.0.1:5000/api/plugins')
            .then(response => response.json())
    }

    loadRegisterPlugins(plugins) {


        const resourceLoader = new ResourceLoader()

        var pluginLoadedPromise = plugins.map(plugin => {

            let loader = resourceLoader.load(plugin, 'js')
            loader.then(() => {
                console.log("Plugin is loaded!")
            }).catch(() => {
                console.log("Error loading plugin")
            })

            return new Promise((resolve, reject) => {
                var resolved = false;

                window.registerPlugin = (pluginPackage) => {
                    console.log("Registering package from plugin", pluginPackage.name)
                    this.props.configurator.import(pluginPackage)
                    resolved = true;
                    resolve();
                };

                setTimeout(() => {
                    if (!resolved) {
                        reject(plugin.id + " did not respond in time");
                    }
                }, 4000);
            });
        })


        console.log("Plugins promises", pluginLoadedPromise);
        return Promise.all(pluginLoadedPromise)
    }

}

export default PluginManager