import {Component} from 'substance'

import PopoverComponent from './../popover/PopoverComponent'
import BarIconComponent from './../bar-icon/BarIconComponent'
import './scss/bar.scss'

class BarComponent extends Component {

    constructor(...args) {
        super(...args)
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
        let popoverEl = $$(PopoverComponent)
            .ref(popover.id)
            .append(popover.component)

        let bariconEl = $$(BarIconComponent, {
            icon: popover.icon
        }).on('click', this.openPopover)

        return [bariconEl, popoverEl]
    }

    openPopover(evt) {
        if (evt.target.nodeName !== 'A') {
            return false
        }

        this.refs.mypopover.extendProps({
            triggerElement: evt.currentTarget
        })
    }
}

export default BarComponent
