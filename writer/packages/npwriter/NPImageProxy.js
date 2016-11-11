import { FileProxy } from 'substance'
import StubFileService from './StubFileService'

let fileService = new StubFileService()

/*
    Assuming a life-cycle which should be consolidated:
    1. A file is considered upstream if it has a uuid set
    2. If no uuid but a local file is present, the file needs to be sync'd
    3. Due to permission reasons 'url' needs to be retrieved from the server everytime
        thus it is a volatile property
    4. FileProxy.sync can only be triggered once at a time
*/
class NPImageProxy extends FileProxy {

    constructor(fileNode, context) {
        super(fileNode, context)

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
        fileService.getUrl(this.fileNode.uuid, (err, result) => {
            if (err) {
                console.error(err)
            } else {
                this.url = result.url
                this.triggerUpdate()
            }
        })
    }

    sync() {
        // For the sake of this example, assuming that an upstream file
        // has a remote uuid, thus if there is not uuid, but a file,
        // it needs to uploaded
        if (!this._isSyncing && !this.fileNode.uuid && this.file) {
            // don't allow to sync multiple times at once
            this._isSyncing = true
            return new Promise((resolve, reject) => {
                // console.log('Uploading file', this.fileNode.id)
                fileService.uploadFile(this.file, (err, result) => {
                    this._isSyncing = false
                    if (err) return reject(err)
                    // console.log('Finished uploading file', this.fileNode.id)
                    // Note: storing the uuid into the fileNode
                    // XML exported can later use this to export valid
                    // links
                    this.fileNode.uuid = result.uuid
                    resolve()
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
NPImageProxy.match = function(fileNode) {
    return fileNode.fileType === 'image'
}

export default NPImageProxy