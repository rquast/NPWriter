import {FileProxy} from 'substance'
import FileService from './FileService'
import isString from 'lodash/isString'

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

        // If this file is being uploaded
        this._isSyncing = false

        // When an url (String) is given as the data an uri needs to be 'uploaded'
        if (isString(fileNode.data)) {
            this.uri = fileNode.data
        } else {
            this.file = fileNode.data
            if (this.file) {
                this._fileUrl = URL.createObjectURL(this.file)
            }
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
        if (this.uri) {
            return this.uri
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
        this.fileService.getUrl(this.fileNode.uuid, this.fileNode.getImType())
            .then((url) => {
                this.url = url
                this.triggerUpdate()
            })
    }

    sync() {
        if(!this._isSyncing) {
            this._isSyncing = true
            if (!this.uuid && this.file) { // regular file upload
                return new Promise((resolve, reject) => {

                    const params = {
                        imType: this.fileNode.getImType()
                    }

                    this.fileService.uploadFile(this.file, params)
                        .then((xmlString) => {
                            this.fileNode.handleDocument(xmlString);
                            this._isSyncing = false
                            resolve()
                        })
                        .catch((e) => {
                            console.log("Error uploading", e);
                            this._isSyncing = false
                            reject(e)
                        })
                })
            } else if (!this.uuid && this.uri) { // uri-based upload

                return new Promise((resolve, reject) => {
                    this.fileService.uploadURL(this.uri, this.fileNode.getImType())
                        .then((xmlString) => {
                            this.fileNode.handleDocument(xmlString);
                            this._isSyncing = false
                            resolve()
                        })
                        .catch((e) => {
                            console.log("Error uploading", e);
                            this._isSyncing = false
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
}

// to detect that this class should take responsibility for a fileNode
NPImageProxy.match = function (fileNode) {
    return fileNode.fileType === 'image'
}

export default NPImageProxy