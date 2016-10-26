import {Component} from 'substance'
import './scss/bar-icon.scss'

class BarIconComponent extends Component {

    constructor(...args) {
        super(...args)
    }

    getInitialState() {
        return {
            active: false
        }
    }

    render($$) {
        var el = $$('div').addClass('sc-np-bar-icon')
            .append(
                $$('a')
                    .addClass('fa fa-image')
                    .on('click', evt => this.onClick(evt))
            )

        if (this.state.active) {
            el.addClass('active')
        }

        return el
    }

    onClick() {
        try {
            this.setState({
                active: !this.state.active
            })
        }
        catch(ex) {}

        return false;
    }
}

export default BarIconComponent
