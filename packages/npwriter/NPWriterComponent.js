import {SplitPane, ScrollPane, Layout, Overlay, ProseEditor} from 'substance'

import ContentMenu from './ContentMenu'
import SidebarPanelComponent from './components/SidebarPanelComponent';

class NPWriterComponent extends ProseEditor {

    _initialize(...args) {
        super._initialize(...args)
        this.exporter = this._getExporter();
    }

    render($$) {
        let el = $$('div').addClass('sc-author')
        el.append(
            $$(SplitPane, {splitType: 'vertical'}).append(
                this._renderMainSection($$),
                this._renderContextSection($$)
            )
        )
        return el
    }

    _renderContextSection($$) {
        return $$(SidebarPanelComponent)
    }

    _renderMainSection($$) {
        let mainSection = $$('div').addClass('se-main-section')

        mainSection.append(
            this._renderContentPanel($$)
        )
        return mainSection
    }

    _renderContentMenu($$) {
        var commandStates = this.commandManager.getCommandStates()

        return $$(ContentMenu, {
            commandStates: commandStates
        }).ref('contentMenu')
    }

    _renderContentPanel($$) {
        const doc = this.documentSession.getDocument()
        const body = doc.get('body')
        var configurator = this.props.configurator

        console.log("configurator", JSON.stringify(configurator.config.nodes,2))

        let contentPanel = $$(ScrollPane, {
            scrollbarType: 'native',
            overlay: Overlay,
        }).ref('contentPanel')

        let layout = $$(Layout, {
            width: 'large'
        })

        var BodyComponent = this.componentRegistry.get('body')

        layout.append(
            $$(BodyComponent, {
                node: body,
                commands: configurator.getSurfaceCommandNames(),
                textTypes: configurator.getTextTypes()
            })
        )

        contentPanel.append(layout)
        contentPanel.append(this._renderContentMenu($$))
        return contentPanel
    }

    _scrollTo(nodeId) {
        this.refs.contentPanel.scrollTo(nodeId)
    }

    _getExporter() {
        return {};
        // return this.props.configurator.createExporter('newsml')
    }

    _documentSessionUpdated(...args) {
        super._documentSessionUpdated(...args)

        var contentMenu = this.refs.contentMenu
        if (contentMenu) {
            var commandStates = this.commandManager.getCommandStates()
            contentMenu.setProps({
                commandStates: commandStates
            });
        }
    }

}

export default NPWriterComponent
