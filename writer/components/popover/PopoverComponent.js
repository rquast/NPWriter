import {Component} from 'substance'
import './scss/popover.scss'

class PopoverComponent extends Component {

    constructor(...args) {
        super(...args)
    }

    getInitialState() {
        return {
            active: null,
            triggerElement: null
        }
    }

    willReceiveProps(props) {
        if (this.state.active === null || !props.triggerElement) {
            this.extendState({
                active: false
            })
            return false
        }


        this.extendState({
            active: !this.state.active,
            triggerElement: props.triggerElement
        })

        return true
    }

    render($$) {
        var el = $$('div')
            .addClass('sc-np-popover')
            .append(
                $$('div')
                    .addClass('sc-np-popover-top')
            )
            .append(
                this.props.children
            )
            .css('left', '-99999px')

        if (this.state.active === true) {
            el.addClass('active');
            window.setTimeout(() => {
                let offset = this.getOffsets(),
                    arrow = this.el.el.querySelector("div:first-child")

                this.el.el.style.left = offset.box + 'px'
                arrow.style.marginLeft = offset.arrow + 'px'
            }, 5)
        }

        return el
    }

    /*
     * Calculate offsets for popover box (left) and it's arrow (margin)
     */
    getOffsets() {
        let triggerElement = this.state.triggerElement,
            left = triggerElement.offsetLeft - (this.el.width / 2) + triggerElement.offsetWidth / 2 + 6,
            margin = 0

        if (left < 10) {
            left = 10
            //margin = -triggerElement.offsetLeft - triggerElement.offsetWidth * 2 - left
            margin = triggerElement.offsetLeft + (triggerElement.offsetWidth / 2) - (this.el.el.offsetWidth / 2) - 5
        }
        else if (left + this.el.width > document.body.clientWidth) {
            let oldLeft = left
            left = document.body.clientWidth - this.el.width - 10
            margin = oldLeft - left
        }

        return {
            box: left,
            arrow: margin
        }
    }
}

export default PopoverComponent
