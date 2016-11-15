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

        this.sourceUrl = fileNode.sourceUrl

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
        // If we have an url, but not uploaded yet
        if (this.sourceUrl) {
            return this.sourceUrl
        }
        // no URL available
        return ""
    }

    fetchUrl() {
        // TODO: this should access the real endpoint
        this.fileService.getUrl(this.fileNode.uuid, this.fileNode.getImType())
            .then((url) => {
                this.url = url
                this.triggerUpdate()
            })
    }

    sync() {

        if (!this.uuid && this.file) { // regular file upload
            return new Promise((resolve, reject) => {

                const params = {
                    imType: this.fileNode.getImType()
                }

                this.fileService.uploadFile(this.file, params)
                    .then((xmlString) => {
                        this.fileNode.handleDocument(xmlString);
                        resolve()
                    })
                    .catch((e) => {
                        console.error("Error uploading", e);
                        reject(e)
                    })
            })
        } else if (!this.uuid && this.sourceUrl) { // url-based upload

            return new Promise((resolve, reject) => {
                this.fileService.uploadURL(this.sourceUrl, this.fileNode.getImType())
                    .then((xmlString) => {
                        this.fileNode.handleDocument(xmlString);
                        resolve()
                    })
                    .catch((e) => {
                        console.error("Error uploading", e);
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