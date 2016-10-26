import {SplitPane, ScrollPane, Layout, SpellCheckManager} from 'substance'
import {AbstractEditor} from 'substance'

import ContentMenu from './ContentMenu'
import SidebarComponent from './components/SidebarComponent'

class NPWriter extends AbstractEditor {

    _initialize(...args) {
        super._initialize(...args)

        this.exporter = this._getExporter();
        this.spellCheckManager = new SpellCheckManager(this.editorSession, {
            wait: 750,
            // same URL as configured in /server/routes/spellcheck.js
            apiURL: '/api/spellcheck'
        })
    }

    didMount() {
        this.editorSession.onUpdate(this.editorSessionUpdated, this)

        this.spellCheckManager.runGlobalCheck()
    }

    dispose() {
        super.dispose()

        this.spellCheckManager.dispose()
    }


    render($$) {
        const el = $$('div').addClass('sc-np-writer')
        el.append(
            $$(SplitPane, {splitType: 'vertical'}).append(
                this._renderMainSection($$),
                this._renderSidebarPanel($$)
            )
        )
        return el
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
        var commandStates = this.editorSession.getCommandStates()
        return $$(ContentMenu, {
            commandStates: commandStates
        }).ref('contentMenu')
    }

    _renderContentPanel($$) {
        const doc = this.editorSession.getDocument()
        const body = doc.get('body')
        var configurator = this.props.configurator;

        let contentPanel = $$(ScrollPane, {
            scrollbarType: 'native',
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

    editorSessionUpdated() {
        var editorSession = this.editorSession
        if (editorSession.hasDocumentChanged() || editorSession.hasSelectionChanged()) {
            // TODO: we should discuss if this really how we want it
            var data = {
                change: {
                    change: editorSession.getChange(),
                    selection: editorSession.getSelection()
                },
                info: editorSession.getChangeInfo(),
                doc: editorSession.getDocument()
            }

            // Trigger onDocumentChanged event
            this.context.api.events.onDocumentChanged(data)
        }
        if (editorSession.hasCommandStatesChanged()) {
            var contentMenu = this.refs.contentMenu
            if (contentMenu) {
                var commandStates = editorSession.getCommandStates()
                contentMenu.setProps({
                    commandStates: commandStates
                })
            }
        }
    }

}

export default NPWriter
