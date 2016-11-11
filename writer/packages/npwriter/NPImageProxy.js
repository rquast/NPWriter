import {FileProxy} from 'substance'
import FileService from './FileService'


class NPImageProxy extends FileProxy {

    constructor(fileNode, context) {
        super(fileNode, context)
        // TODO: assuming a life-cycle which would need discussion
        // 1. A file is considered upstream if it has a uuid set
        // 2. If no uuid but a local file is present, the file needs to be sync'd
        // 3. Due to permission reasons 'url' needs to be retrieved from the server everytime
        //    thus it is a volatile property

        this.fileService = new FileService(this.context.api)
        this.fileNode = fileNode
        // used locally e.g. after drop or file dialog
        this.file = fileNode.data
        if (this.file) {
            this._fileUrl = URL.createObjectURL(this.file)
        }
        // TODO: this should be consistent: either always fetch the url or never
        this.url = fileNode.url
        if (!this.url && fileNode.uuid) {
            this.fetchUrl()
        }
    }

    getUrl() {
        // if we have fetched the url already, just serve it here
        if (this.url) {
            return this.url
        }
        // if we have a local file, use it's data URL
        if (this._fileUrl) {
            return this._fileUrl
        }
        // no URL available
        return ""
    }

    fetchUrl() {
        // TODO: this should access the real endpoint
        // this.context.api.router.get('/api/image/url/' + this.uuid+'?imType=x-im/image')
        //     .then(response => response.text())
        //     .then((url) => {
        //         this.url = url
        debugger;
        this.fileService.getUrl(this.uuid, (err, result) => {
            if (err) {
                console.error(err)
            } else {
                this.url = result.url
                this.triggerUpdate()
            }
        })
    }

    sync() {
        if (!this.uuid && this.file) {
            return new Promise((resolve, reject) => {

                // console.log('Uploading file', this.fileNode.id)
                const params = {
                    imType: 'x-im/image'
                }

                this.fileService.uploadFile(this.file, params)
                    .then((xmlString) => {

                        const parser = new DOMParser()
                        let newsItemDOM = parser.parseFromString(xmlString, 'text/xml')
                        let documentElement = newsItemDOM.documentElement
                        let uuid = documentElement.getAttribute('guid')

                        const document = this.context.api.editorSession.document

                        const ximimageNode = document.get(this.fileNode.parentNodeId)

                        try {
                            document.set([ximimageNode.id, 'uuid'], uuid);
                        } catch(e) {

                        }


                        this.fileNode.uuid = uuid
                        this.fileNode.uri = documentElement.querySelector('itemMeta > itemMetaExtProperty[type="imext:uri"]').getAttribute('value')

                        console.log('Finished uploading file', this.fileNode.id)
                        resolve()
                    })
                    .catch((e) => {
                        console.log("Error uploading", e);
                        reject(e)
                    })
            })
        } else {
            // console.log("Get url for", this.uuid);
            // this.fetchUrl()
            // return ""
            return Promise.resolve()
        }
    }
}

// to detect that this class should take responsibility for a fileNode
NPImageProxy.match = function (fileNode) {
    return fileNode.fileType === 'image'
}

export default NPImageProxy