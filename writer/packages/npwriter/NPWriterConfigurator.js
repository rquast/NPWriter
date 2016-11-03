import {Configurator, Component} from 'substance'
import 'whatwg-fetch'

class NPWriterConfigurator extends Configurator {

    constructor(...args) {
        super(...args)

        this.config.popovers = []
        this.config.validators = []
        this.config.sidebarTopBar = []
        this.config.sidebarTabs = []
        this.config.sidebarPanels = []
        this.config.uis = new Map()
        // HACK: workaround when there is not overlay tool registered
        this.config.tools.set('overlay', new Map());
    }


    /**
     * Add a substance Component in a popover that is triggered by an
     * icon in the top bar.
     *
     * @param {string} id Package id
     * @param {object} def Definition for the popover trigger icon or button
     * @param {Component} component Substance component
     *
     * @example
     * config.addPopover(
     *      'mypopover-2001',     // Unique id for this popover
     *      {
     *          icon: 'fa-plane', // Font awesome icon class or image url
     *          align: 'left'     // Left or right aligned
     *      },
     *      AboutComponent        // Component to render in popover
     * )
     */
    addPopover(id, def, component) {
        def.align = def.align === 'left' ? 'left' : 'right'
        def.button = def.button === true ? true : false

        if (!def.icon) {
            throw new Error('Popover trigger must have a default icon')
        }

        this.config.popovers.push({
            id: id,
            icon: def.icon,
            button: def.button,
            align: def.align,
            css: def.css || {},
            component: component
        })
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

        this.addComponent(id + "-tab", component)
        this.config.sidebarPanels.push({
            id: id,
            tabId: tabId,
            component: component,
            getCSSFriendlyName: () => {
                return id.replace(/\./g, '-')
            }
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
            id: pluginId,
            component: component,
            getCSSFriendlyName: () => {
                return pluginId.replace(/\./g, '-')
            }

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
                this.config.writerConfigFile = json
            })
    }

    /**
     * Returns the newsItemTemplateId from the configFile
     * @returns {*}
     */
    getNewsItemTemplateId() {
        return this.config.writerConfigFile.newsItemTemplateId
    }
}

export default NPWriterConfigurator
