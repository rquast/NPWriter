import { Configurator, Component } from 'substance'

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

        this.addComponent(tabId+"-tab", component)
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
        this.addComponent(pluginId+"-topbar", component)

        this.config.sidebarTopBar.push({
            type: pluginId,
            component: component
        })
    }

    addValidator(validator) {
        this.config.validators.push(validator)
    }

}

export default NPWriterConfigurator