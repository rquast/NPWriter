import {SplitPane, ScrollPane, SpellCheckManager} from 'substance'
import {AbstractEditor} from 'substance'

import SidebarComponent from './components/SidebarComponent'
import DialogMessageComponent from '../dialog/DialogMessageComponent'
import BarComponent from './../../components/bar/BarComponent'
import DialogPlaceholder from '../dialog/DialogPlaceholder'
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
            this.hideDialog()
        }

        this.handleActions(actionHandlers)
    }

    didMount() {
        super.didMount()

        this.spellCheckManager.runGlobalCheck()
        this.editorSession.onUpdate(this.editorSessionUpdated, this)

        this.props.api.setWriterReference(this);
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

        // this.spellCheckManager.dispose()
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
            ),
            this._renderModalContainer($$)
        )

        return el
    }

    _renderModalContainer($$) {
        return $$(DialogPlaceholder, {}).addClass('modal-placeholder').ref('modalPlaceholder')

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
        let ContextMenu = this.getComponent('npw-context-menu')
        const OverlayMenu = this.getComponent('npw-overlay-menu')
        const ContentMenu = this.getComponent('npw-content-menu')
        const BodyComponent = this.getComponent('body')

        let contentPanel = $$(ScrollPane, {
            scrollbarType: 'native',
            contextMenu: 'custom'
        }).ref('contentPanel')

        let layout = $$('div').addClass('se-layout')



        layout.append(
            $$(BodyComponent, {
                node: body,
                commands: configurator.getSurfaceCommandNames(),
                textTypes: configurator.getTextTypes(),
                // spellcheck: 'native'
            })
        )

        contentPanel.append([
            layout,
            $$(ContextMenu),
            $$(OverlayMenu),
            $$(ContentMenu)
        ])
        return contentPanel
    }

    _scrollTo(nodeId) {
        this.refs.contentPanel.scrollTo(nodeId)
    }


    hideDialog() {
        this.refs.modalPlaceholder.setProps({
            showModal: false
        })
    }

    /**
     *
     * @param {Component} contentComponent The component passed in by the user, Should be instance of a Substance Component
     * @param {object} props An object passed by user that is later reached by this.props in the contentComponent
     * @param {object} options Options passed to the DialogComponent
     */
    showDialog(contentComponent, props, options) {
        this.refs.modalPlaceholder.setProps({
            showModal: true,
            contentComponent: contentComponent,
            props: props,
            options: options
        })

    }

    showMessageDialog(messages, props, options) {
        props.messages = {
            error: [],
            warning: [],
            info: [],
            title: []
        };

        for (var n = 0; n < messages.length; n++) {
            switch (messages[n].type) {
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
        this.refs.modalPlaceholder.setProps({
            showModal: true,
            contentComponent: DialogMessageComponent,
            props: props,
            options: options
        })

    }

    _getExporter() {
        return {}
        // return this.props.configurator.createExporter('newsml')
    }


}

export default NPWriter
