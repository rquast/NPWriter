import {Component} from 'substance'

import PopoverComponent from './../popover/PopoverComponent'
import BarIconComponent from './../bar-icon/BarIconComponent'
import './scss/bar.scss'

class BarComponent extends Component {

    constructor(...args) {
        super(...args)
    }

    render($$) {
        let popover = $$(PopoverComponent)
            .ref('mypopover')
            .append(
                $$('div').append(
                    'Hello popover! Halo!'
                )
                .css('padding', '10px')
            )

        let baricon = $$(BarIconComponent).on('click', this.openPopover)

        let leftRibbon = $$('div'),
            rightRibbon = $$('div');

        // TODO: Handle here in what section sub components should go
        rightRibbon.append([
            baricon,
            popover
        ])

        return $$('div')
            .addClass('sc-np-bar')
            .append([
                leftRibbon,
                rightRibbon
            ])
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
