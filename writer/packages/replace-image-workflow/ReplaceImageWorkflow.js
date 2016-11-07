import { Workflow } from 'substance'

class Progressbar extends Component {
    render() {
        let el = $$('progress')
            .addClass('se-progress')
            .val(this.props.progress)
            .attr('max', 100)
            .text(String(this.props.progress))
    }
}

/*
    Example usage:

    ```js
    editorSession.startWorkflow('replace-image-workflow', {
        path: [this.props.node.id, 'url']
    })
    ```
*/

class ReplaceImageWorkflow extends Worfklow {

    didMount() {
        // Trigger upload dialog
        this.refs.fileInput.click()
    }

    _onFileSelected(e) {
        let file = e.currentTarget.files[0]
        let fileClient = this.context.fileClient
        let editorSession = this.context.editorSession

        fileClient.uploadFile(file, (err, url) => {
            editorSession.transaction((tx) => {
                // Update image url (triggers a rerender of the image node)
                tx.set(this.props.path, url)
            })
            editorSession.endWorkflow()
        })
    }

    _cancel() {
        editorSession.endWorkflow()
    }

    render() {
        let Button = this.getComponent('button')
        let el = $$('div').addClass('sc-replace-image-workflow')

        el.append(
            $$('input')
                .attr('type', 'file')
                .ref('fileInput')
                // .attr('multiple', 'multiple')
                .on('change', this._onFileSelected)
        )

        if (this.state.uploading) {
            el.append(
                $$(Progressbar, { progress: this.state.progress })
            )
        }

        el.append(
            $$(Button, {
              icon: 'cancel',
              label: 'cancel',
            }).on('click', this._cancel)
        )
        return el
    }
}

export default ReplaceImageWorkflow