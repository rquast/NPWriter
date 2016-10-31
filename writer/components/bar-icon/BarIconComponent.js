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
                    .addClass('fa ' + this.props.icon)
                    .on('click', evt => this.onClick(evt))
            )

        if (this.state.active) {
            el.addClass('active')
        }

        return el
    }

    onClick() {
        try {
            // HACK: Avoid having the element detached before calculations
            window.setTimeout(() => {
                this.setState({
                    active: !this.state.active
                })
            }, 50)
        }
        catch(ex) {}

        return false;
    }
}

export default BarIconComponent
