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
            tabId: "one"
        }
    }

    render($$) {

        const el = $$('div').addClass('se-context-section').ref('contextSection');
        const scrollPane = $$(ScrollPane, {
            scrollbarType: 'native', //or substance
            scrollbarPosition: 'left'
        }).ref('contextSectionScrollpane');

        var tabId = this.state.tabId;

        let panels = this.context.configurator.config.sidebarPanels.filter((panel) => {
            return panel.tabId === tabId
        }).map((panel) => {
            return $$('div')
                .addClass('plugin')
                .append($$(panel.component, {panel}))
        })
        scrollPane.append(
            $$(TabbedPane, {activeTab: tabId, tabs: this.state.tabs})
                .ref("" + this.state.tabId)
                .append(panels)
        )

        el.append(scrollPane)
        return el
    }

    switchContext(tabId) {
        this.extendState({tabId: tabId})
    }
}

export default SidebarComponent
