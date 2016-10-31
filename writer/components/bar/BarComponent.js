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

    onSetStatusText(id, statusText) {
        if (this.state.status[id + '_status'] === statusText) {
            return
        }

        this.state.status[id + '_status'] = statusText
        this.rerender()
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
                    setStatusText: (statusText) => this.onSetStatusText(id, statusText),
                    setButtonText: (buttonText) => this.onSetButtonText(id, buttonText),
                    setIcon: (iconClass) => this.onSetIcon(id, iconClass)
                })
                .ref(popover.id + '_comp')
            )

        // Container with trigger
        let containerEl = $$('div').append(
            this.renderTrigger($$, popover, id)
        )

        // Status text
        if (this.state.status[id + '_status']) {
            let statusEl = $$('p')
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
                icon: iconClass
            })
            .on('click', (evt) => this.openPopover(evt, id))

            return bariconEl
        }
        else {
            let barbuttonEl = $$(ButtonComponent, {
                contextIcon: iconClass,
                label: this.state.button[id + '_btn'],
                contextClick: (evt) => this.openPopover(evt, id),
                buttonClick: (evt) => this.buttonClick(evt, id)
            }).ref(popover.id + '_btn')

            return barbuttonEl
        }
    }

    openPopover(evt, id) {
        if (evt.target.nodeName !== 'A' && evt.currentTarget.nodeName !== 'BUTTON') {
            return false
        }

        this.refs[id].extendProps({
            triggerElement: evt.currentTarget
        })
    }

    buttonClick(evt, id) {
        if (this.refs[id + '_comp'].defaultAction) {
            this.refs[id + '_comp'].defaultAction()
        }
    }
}

export default BarComponent
