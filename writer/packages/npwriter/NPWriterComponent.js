import {SplitPane, ScrollPane, Layout} from 'substance'
import {AbstractEditor} from 'substance'

import ContentMenu from './ContentMenu'
import SidebarComponent from './components/SidebarComponent'
import NPWriterOverlayTools from './NPWriterOverlayTools'

import BarComponent from './../../components/bar/BarComponent'

class NPWriter extends AbstractEditor {

    _initialize(...args) {
        super._initialize(...args)
        this.exporter = this._getExporter();
    }

    didMount() {
        this.documentSession.on('didUpdate', this.documentSessionUpdated, this)
    }


    render($$) {
        const el = $$('div')
            .addClass('sc-np-writer')

        el.append(
            this._renderMainbarPanel($$),
            $$(SplitPane, {splitType: 'vertical'}).append(
                this._renderMainSection($$),
                this._renderSidebarPanel($$)
            )
        )

        return el
    }

    _renderMainbarPanel($$) {
        return $$(BarComponent, {
            popovers: this.props.configurator.config.popovers
        }).ref('topBar')
    }

    _renderSidebarPanel($$) {
        return $$(SidebarComponent)
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
        var configurator = this.props.configurator;

        let contentPanel = $$(ScrollPane, {
            scrollbarType: 'native',
            overlay: NPWriterOverlayTools,
            gutter: this._renderContentMenu($$)
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
        return contentPanel
    }

    _scrollTo(nodeId) {
        this.refs.contentPanel.scrollTo(nodeId)
    }

    _getExporter() {
        return {}
        // return this.props.configurator.createExporter('newsml')
    }

    documentSessionUpdated(...args) {

        // Trigger onDocumentChanged event
        this.context.api.events.onDocumentChanged(...args)

        var contentMenu = this.refs.contentMenu
        if (contentMenu) {
            var commandStates = this.commandManager.getCommandStates()
            contentMenu.setProps({
                commandStates: commandStates
            })
        }
    }

}

export default NPWriter
