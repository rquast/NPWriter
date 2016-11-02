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
            tabId: "main"
        }
    }

    getTabs() {
        return this.context.configurator.config.sidebarTabs
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

        let tabsPanel = $$(TabbedPane, {activeTab: tabId, tabs: this.getTabs()})
            .ref("tab_" + this.state.tabId)
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
                .addClass('plugin plugin-'+plugin.getCSSFriendlyName())
                .append($$(plugin.component, {panel: plugin}))
        })
    }

    getSidebarPanelsForTabId($$, tabId) {
        return this.context.configurator.getSidebarPanels().filter((panel) => {
            return panel.tabId === tabId
        }).map((panel) => {
            return $$('div')
                .addClass('plugin plugin-'+panel.getCSSFriendlyName())
                .append($$(panel.component, {panel: panel}).ref('plugin-component-'+panel.id))
                .ref('plugin-panel-'+panel.id)
        })
    }
}

export default SidebarComponent
