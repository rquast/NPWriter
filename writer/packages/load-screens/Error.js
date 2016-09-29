import { Component } from 'substance'

class Error extends Component {

    render($$) {
        const el = $$('div').attr('style', 'color: red').append('Error' + this.props.error)
        return el
    }
}

export default Error