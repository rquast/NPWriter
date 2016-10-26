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
        let baricon = $$(BarIconComponent)
            .on('click', evt => {
                alert(evt)
                return false
            })

        return $$('div')
            .addClass('sc-np-bar')
            .append([
                baricon,
                popover
            ])
    }
}

export default BarComponent
