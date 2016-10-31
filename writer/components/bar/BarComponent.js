import {Component} from 'substance'

import PopoverComponent from './../popover/PopoverComponent'
import BarIconComponent from './../bar-icon/BarIconComponent'
import './scss/bar.scss'

class BarComponent extends Component {

    constructor(...args) {
        super(...args)
    }

    getInitialState() {
        return {
            statusText: {}
        }
    }

    onStatusText(id, statusText) {
        if (this.state.statusText[id + '_status'] === statusText) {
            return
        }

        this.state.statusText[id + '_status'] = statusText
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
                    setStatusText: (statusText) => this.onStatusText(id, statusText)
                })
            )

        // Container for icons, texts, etc
        let containerEl = $$('div')

        // The popover icon
        let bariconEl = $$(BarIconComponent, {
            icon: popover.icon
        }).on('click', (evt) => this.openPopover(evt, id))
        containerEl.append(bariconEl)

        // Status text
        if (this.state.statusText[id + '_status']) {
            let statusEl = $$('p')
                .ref(popover.id + '_status')
                .append(
                    this.state.statusText[id + '_status']
                )

            containerEl.append(statusEl)
        }

        return [containerEl, popoverEl]
    }

    openPopover(evt, id) {
        if (evt.target.nodeName !== 'A') {
            return false
        }

        this.refs[id].extendProps({
            triggerElement: evt.currentTarget
        })
    }
}

export default BarComponent
