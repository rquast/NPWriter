import {Component} from 'substance'

import PopoverComponent from './../popover/PopoverComponent'
import BarIconComponent from './../bar-icon/BarIconComponent'
import ButtonComponent from './../button/ButtonComponent'
import './scss/bar.scss'

class BarComponent extends Component {

    constructor(...args) {
        super(...args)
    }

    getInitialState() {
        return {
            status: {},
            button: {}
        }
    }

    // didUpdate() {
    //     if (this.state.flashStatus) {
    //         this.refs[this.state.flashStatus].addClass('imc-flash')
    //     }
    // }

    onSetStatusText(id, statusText) {
        if (this.state.status[id + '_status'] === statusText) {
            return
        }

        this.state.status[id + '_status'] = statusText
        this.extendState({
            flashStatus: id + '_status'
        })
    }

    onSetButtonText(id, buttonText) {
        if (this.state.button[id + '_btn'] === buttonText) {
            return
        }

        this.state.button[id + '_btn'] = buttonText
        this.rerender()
    }

    onSetIcon(id, iconClass) {
        this.state.button[id + '_icon'] = iconClass
        this.rerender()
    }

    onSetEnabled(id, enabled) {
        this.state.button[id + '_disabled'] = !enabled
        this.rerender()
    }

    render($$) {
        let popovers = this.props.popovers.length ? this.props.popovers : [],
            leftRibbon = $$('div'),
            rightRibbon = $$('div')

        popovers.forEach(popover => {
            let els = this.renderPopover($$, popover)
            if (popover.align === 'left') {
                leftRibbon.append(els)
            }
            else {
                rightRibbon.append(els)
            }
        })

        return $$('div')
            .addClass('sc-np-bar')
            .append([
                leftRibbon,
                rightRibbon
            ])
    }

    renderPopover($$, popover) {
        var id = popover.id

        // Actual popover
        let popoverEl = $$(PopoverComponent)
            .ref(popover.id)
            .append(
                $$(popover.component, {
                    popover: {
                        setStatusText: (statusText) => this.onSetStatusText(id, statusText),
                        setButtonText: (buttonText) => this.onSetButtonText(id, buttonText),
                        setIcon: (iconClass) => this.onSetIcon(id, iconClass),
                        disable: () => this.onSetEnabled(id, false),
                        enable: () => this.onSetEnabled(id, true),
                        close: () => this.closePopover(id)
                    }
                })
                .ref(popover.id + '_comp')
            )

        // Container with trigger
        let containerEl = $$('div')
            .addClass('sc-np-bar-container')
            .append(
                this.renderTrigger($$, popover, id)
            )

        // Status text
        if (this.state.status[id + '_status']) {
            let statusEl = $$('p')
                .addClass('sc-np-bar-item')
                .ref(popover.id + '_status')
                .append(
                    this.state.status[id + '_status']
                )

            containerEl.append(statusEl)
        }

        return [containerEl, popoverEl]
    }

    renderTrigger($$, popover, id) {
        let iconClass = popover.icon
        if (this.state.button[id + '_icon']) {
            iconClass = this.state.button[id + '_icon']
        }

        if (!this.state.button[id + '_btn'] || !popover.button) {
            let bariconEl = $$(BarIconComponent, {
                icon: iconClass,
                css: popover.css,
                enabled: this.state.button[id + '_disabled'] ? false : true
            })
            .on('click', (evt) => this.openPopover(evt, id))

            return bariconEl
        }
        else {
            let barbuttonEl = $$(ButtonComponent, {
                contextIcon: iconClass,
                label: this.state.button[id + '_btn'],
                enabled: this.state.button[id + '_disabled'] ? false : true,
                contextClick: (evt) => this.openPopover(evt, id),
                buttonClick: (evt) => this.buttonClick(evt, id)
            }).ref(popover.id + '_btn')

            return barbuttonEl
        }
    }

    openPopover(evt, id) {
        let triggerElement = null

        if (evt.target.nodeName === 'A') {
            triggerElement = evt.target
        }
        else if (evt.currentTarget.nodeName === 'BUTTON') {
            triggerElement = evt.currentTarget
        }
        else {
            return
        }

        this.refs[id].extendProps({
            triggerElement: triggerElement
        })
    }

    closePopover(id) {
        this.refs[id].extendProps({
            triggerElement: null
        })
    }

    buttonClick(evt, id) {
        if (this.refs[id + '_comp'].defaultAction) {
            this.refs[id + '_comp'].defaultAction()
        }
    }
}

export default BarComponent
