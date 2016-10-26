import {Component} from 'substance'
import './scss/popover.scss'

class PopoverComponent extends Component {

    constructor(...args) {
        super(...args)
    }

    render($$) {
        return $$('div')
            .addClass('sc-np-popover sc-np-popover-top')
    }
}

export default PopoverComponent
