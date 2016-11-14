import { FileProxy } from 'substance'

class NPImageProxy extends FileProxy {

    constructor(fileNode, context) {
        super(fileNode, context)
        // NPWriter id
        // used when importing from XML to resolve a URL from NPWriter
        this.uuid = fileNode.uuid
        // used locally e.g. after drop or file dialog
        this.file = fileNode.data
        this.url = fileNode.url || this.getUrl()

        if (!this.url && this.uuid) this.fetchUrl()
    }

    fetchUrl() {
        this.context.api.router.get('/api/image/url/' + this.uuid+'?imType=x-im/image')
            .then(response => response.text())
            .then((url) => {
                this.url = url
                this.triggerUpdate()
            })
            .catch(function (error, xhr, text) {
                // TODO: Display error message
                console.error(error, xhr, text);
            });
    }

    getUrl() {
        if (this.url) {
            return this.url
        } else if (this.file) {
            return URL.createObjectURL(this.file)
        } else {
            this.fetchUrl()
            return ""
        }
    }
}

// to detect that this class should take responsibility for a fileNode
NPImageProxy.match = function(fileNode) {
    return fileNode.fileType === 'image'
}

export default NPImageProxy