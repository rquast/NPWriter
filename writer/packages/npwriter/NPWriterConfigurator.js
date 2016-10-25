import {Configurator, Component} from 'substance'
import 'whatwg-fetch'

class NPWriterConfigurator extends Configurator {

    constructor(...args) {
        super(...args)

        this.config.validators = []
        this.config.sidebarTopBar = []
        this.config.sidebarTabs = []
        this.config.sidebarPanels = []
        this.config.uis = new Map()
        // HACK: workaround when there is not overlay tool registered
        this.config.tools.set('overlay', new Map());
    }


    /**
     * Adds a tab to the right sidebar
     * @param id
     * @param name
     */
    addSidebarTab({id, name}) {
        this.config.sidebarTabs.push({
            id: id,
            name: name
        })
    }

    /**
     * Adds a Substance Component to a a panel by specifying the tabId
     * @param id
     * @param tabId
     * @param component
     */
    addComponentToSidebarWithTabId(id, tabId, component) {
        if (!component instanceof Component) {
            throw new Error('Ui must be an instance of Component')
        }

        this.addComponent(tabId + "-tab", component)
        this.config.sidebarPanels.push({
            type: id,
            tabId: tabId,
            component: component
        })
    }


    /**
     * Returns a registered sidebarPanels
     * @returns {Array}
     */
    getSidebarPanels() {
        return this.config.sidebarPanels
    }


    addComponentToSidebarTop(pluginId, component) {
        this.addComponent(pluginId + "-topbar", component)

        this.config.sidebarTopBar.push({
            type: pluginId,
            component: component
        })
    }

    addValidator(validator) {
        this.config.validators.push(validator)
    }


    /**
     * Loads /api/config endpoint and stores it in configurator
     * Checks if http status code is 200 otherwise throw an exception
     * @param {string} configURL The URL to the config endpoint
     * @returns {Promise.<TResult>|*}
     * @throws Error
     */
    loadConfigJSON(configURL) {
        return fetch(configURL)
            .then((response) => {
                if (response.status === 200) {
                    return response
                } else {
                    var error = new Error("Failed to load config file")
                    error.response = response
                    throw error
                }
            })
            .then(response => response.json())
            .then((json) => {
                try {
                    this.config.writerConfigFile = json
                } catch (e) {
                    throw new Error("Could not load Config file", e)
                }
            })
    }

}

export default NPWriterConfigurator