import {SplitPane, ScrollPane, SpellCheckManager} from 'substance'
import {AbstractEditor} from 'substance'

import ContentMenu from './ContentMenu'
import SidebarComponent from './components/SidebarComponent'

import BarComponent from './../../components/bar/BarComponent'
import DialogComponent from '../dialog/DialogComponent'

class NPWriter extends AbstractEditor {

    _initialize(...args) {
        super._initialize(...args)

        this.exporter = this._getExporter();
        this.spellCheckManager = new SpellCheckManager(this.editorSession, {
            wait: 400,
            // same URL as configured in /server/routes/spellcheck.js
            apiURL: '/api/spellcheck'
        })
    }

    didMount() {
        super.didMount()

        this.spellCheckManager.runGlobalCheck()
        this.editorSession.onUpdate(this.editorSessionUpdated, this)

        this.props.api.refs.writer = this

    }

    editorSessionUpdated(data) {
        this.props.api.events.onDocumentChanged(data)
    }

    dispose() {
        super.dispose()

        this.spellCheckManager.dispose()
    }


    render($$) {
        this.$$ = $$
        const el = $$('div')
            .addClass('sc-np-writer').ref('npwriter')

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

    getComponent(name) {
        return this.componentRegistry.get(name)
    }

    _renderContentPanel($$) {
        const doc = this.editorSession.getDocument()
        const body = doc.get('body')
        let configurator = this.props.configurator
        let ContextMenu = this.getComponent('context-menu')
        let Overlay = this.getComponent('overlay')

        let contentPanel = $$(ScrollPane, {
            scrollbarType: 'native'
        }).ref('contentPanel')

        let layout = $$('div').addClass('se-layout')

        var BodyComponent = this.componentRegistry.get('body')

        layout.append(
            $$(BodyComponent, {
                node: body,
                commands: configurator.getSurfaceCommandNames(),
                textTypes: configurator.getTextTypes()
            })
        )

        contentPanel.append([
            layout,
            $$(ContextMenu),
            $$(Overlay),
            $$(ContentMenu)
        ])
        return contentPanel
    }

    _scrollTo(nodeId) {
        this.refs.contentPanel.scrollTo(nodeId)
    }


    /**
     *
     * @param {Component} contentComponent The component passed in by the user, Should be instance of a Substance Component
     * @param {object} props An object passed by user that is later reached by this.props in the contentComponent
     * @param {object} options Options passed to the DialogComponent
     */
    showDialog(contentComponent, props, options) {


        const context = {
            context: {
                api: this.props.api
            }
        };

        const dialog = {
            content: contentComponent,
            contentProps: Object.assign({}, props, context),
            options: options
        };

        this.refs.npwriter.append(this.$$(DialogComponent, dialog));
    }

    _getExporter() {
        return {}
        // return this.props.configurator.createExporter('newsml')
    }


}

export default NPWriter
