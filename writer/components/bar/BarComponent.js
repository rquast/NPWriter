import {Component} from 'substance'
import './scss/bar.scss'

class BarComponent extends Component {

    constructor(...args) {
        super(...args)
    }

    render($$) {
        return $$('div')
            .addClass('sc-np-bar')
    }
}

export default BarComponent
