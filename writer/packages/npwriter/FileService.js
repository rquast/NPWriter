
class FileService {

    constructor(api) {
        this.api = api
    }

    getUrl(uuid, imType) {

        // return promise

    }

    /**
     *
     * @param file
     * @param params
     * @returns {Promise}
     */
    uploadFile(file, params) {
        return this.api.upload.uploadFile(file, params)

    }
}
export default FileService