import {SplitPane, ScrollPane, SpellCheckManager} from 'substance'
import {AbstractEditor} from 'substance'

import ContentMenu from './ContentMenu'
import SidebarComponent from './components/SidebarComponent'

import BarComponent from './../../components/bar/BarComponent'
import DialogComponent from '../dialog/DialogComponent'
import DialogMessageComponent from '../dialog/DialogMessageComponent'
import Event from '../../utils/Event'

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

    constructor(...args) {
        super(...args)

        const actionHandlers = {}
        actionHandlers[Event.DIALOG_CLOSE] = () => {
            this.setState({})
        }

        this.handleActions(actionHandlers)
    }

    didMount() {
        super.didMount()

        this.spellCheckManager.runGlobalCheck()
        this.editorSession.onUpdate(this.editorSessionUpdated, this)

        this.props.api.refs.writer = this

    }


    editorSessionUpdated(data) {
        if (data._change) {
            // console.log('...has unsaved changes', data._hasUnsavedChanges)
            // console.log('...is transacting     ', data._isTransacting)
            // console.log('...is saving          ', data._isSaving)
            // console.log('...number of changes  ', data._history.doneChanges.length);
            // console.log('...change             ', data._change);
            // console.log('...current change     ', data._currentChange);
            // console.log('-----------------------------------------------------')

            this.props.api.events.documentChanged(null, {
                type: 'edit',
                action: 'edit',
                data: data._change
            })
        }
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
            $$(SplitPane, {splitType: 'vertical'}).ref('splitPane').append(
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
        return $$(SidebarComponent).ref('sidebar')
    }

    _renderMainSection($$) {
        let mainSection = $$('div').addClass('se-main-section').ref('main-section')

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

        const dialog = {
            content: contentComponent,
            contentProps: Object.assign({}, props, this.context),
            options: options
        };

        this.refs.npwriter.append(this.$$(DialogComponent, dialog))
    }

    showMessageDialog( messages, props, options) {
        props.messages = {
            error: [],
            warning: [],
            info: [],
            title: []
        };

        for (var n = 0; n < messages.length; n++) {
            switch(messages[n].type) {
                case 'error':
                    props.messages.error.push(messages[n]);
                    break;
                case 'warning':
                    props.messages.warning.push(messages[n]);
                    break;
                case 'title':
                    props.messages.title.push(messages[n]);
                    break;
                default:
                    props.messages.info.push(messages[n]);
            }
        }

        var dialog = {
            content: DialogMessageComponent,
            contentProps: Object.assign({}, props, this.context),
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
