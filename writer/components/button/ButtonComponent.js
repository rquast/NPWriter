import {Component} from 'substance'
import './scss/button.scss'

class ButtonComponent extends Component {

    constructor(...args) {
        super(...args)
    }

    getInitialState() {
        return {
            active: false
        }
    }

    render($$) {
        let buttonEl = $$('button')
            .append(
                this.props.label
            )
            .on('click', evt => this.onButtonClick(evt))

        if (!this.props.contextIcon) {
            return buttonEl
        }

        let buttonGroupEl = $$('div')
            .addClass('sc-np-btn-group')
            .append([
                buttonEl,
                $$('button').append(
                    $$('i')
                        .addClass('fa ' + this.props.contextIcon)
                )
                .on('click', evt => this.onContextClick(evt))
            ])

        return buttonGroupEl
    }

    onButtonClick(evt) {
        try {
            if (this.props.buttonClick) {
                this.props.buttonClick(evt)
            }
        }
        catch(ex) {}
    }

    onContextClick(evt) {
        try {
            if (this.props.contextClick) {
                this.props.contextClick(evt)
            }

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

export default ButtonComponent
