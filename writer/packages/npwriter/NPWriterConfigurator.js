import { Configurator, Component } from 'substance'

class NPWriterConfigurator extends Configurator {

    constructor(...args) {
        super(...args)

        this.config.validators = []
        this.config.sidebarTabs = []
        this.config.sidebarPanels = []
        this.config.uis = new Map()
        // HACK: workaround when there is not overlay tool registered
        this.config.tools.set('overlay', new Map());
    }


    addSidebarTab({id, name}) {
        this.config.sidebarTabs.push({
            id: id,
            name: name
        })
    }

    addToSidebar(id, tabId, component) {
        this.addComponent(tabId+"-tab", component)

        this.config.sidebarPanels.push({
            type: id,
            tabId: tabId,
            component: component
        })
    }

    addUi(type, component) {

        if (!component instanceof Component) {
            console.log("Ui must be an instance of Component");
        }
        this.config.uis.set(type, component)

    }

    addValidator(validator) {
        this.config.validators.push(validator)
    }

}

export default NPWriterConfigurator