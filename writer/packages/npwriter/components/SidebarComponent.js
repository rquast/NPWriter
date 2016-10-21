import {Component, ScrollPane, TabbedPane, TabbedPanePackage} from 'substance'

class SidebarComponent extends Component {

    constructor(...args) {
        super(...args)

        this.handleActions({
            switchTab: this.switchContext
        })
    }

    getInitialState() {
        return {
            tabs: this.context.configurator.config.sidebarTabs.reverse(),
            tabId: "main"
        }
    }

    render($$) {

        const el = $$('div').addClass('se-context-section').ref('sidebar');
        const scrollPane = $$(ScrollPane, {
            scrollbarType: 'native', //or substance
            scrollbarPosition: 'left'
        }).ref('sidebarScrollpane');

        var tabId = this.state.tabId;

        let panels = this.getSidebarPanelsForTabId($$, tabId)
        let topBars = this.getTopBarComponents($$)

        let tabsPanel = $$(TabbedPane, {activeTab: tabId, tabs: this.state.tabs})
            .ref("" + this.state.tabId)
            .append(panels)

        let topBar = $$('div').addClass('sidebar-top').append(topBars)

        scrollPane.append([topBar, tabsPanel])

        el.append(scrollPane)
        return el
    }

    switchContext(tabId) {
        this.extendState({tabId: tabId})
    }

    getTopBarComponents($$) {
        return this.context.configurator.config.sidebarTopBar.map((plugin) => {
            return $$('div')
                .addClass('plugin plugin-'+plugin.type)
                .append($$(plugin.component, {panel: plugin}))
        })
    }

    getSidebarPanelsForTabId($$, tabId) {
        return this.context.configurator.getSidebarPanels().filter((panel) => {
            return panel.tabId === tabId
        }).map((panel) => {
            console.log("panel.component", $$(panel.component));
            return $$('div')
                .addClass('plugin plugin-'+panel.type)
                .append($$(panel.component, {panel: panel}))
        })
    }
}

export default SidebarComponent
