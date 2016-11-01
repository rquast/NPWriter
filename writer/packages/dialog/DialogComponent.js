import {Component} from 'substance'

class DialogComponent extends Component {

    didMount() {
    }

    render($$) {

        console.log("OPEN");
        const props = this.props;
        const options = props.options;

        const modal = $$('div').attr('id', 'im-modal-default').addClass('modal').ref('modal')
        const modalBody = $$('div').addClass('modal-body');

        const contentComponent = props.content;

        modalBody.append(
            $$(contentComponent, props.contentProps).ref('contentComponent')
        )

        modal.append(modalBody);

        return modal
    }
}

export default DialogComponent