
class FileService {

    constructor(api) {
        this.api = api
    }

    getUrl(uuid, imType) {

        return this.api.router.get('/api/image/url/' + uuid+'?imType='+imType)

            .then(response => response.text())

            .catch(function (error, xhr, text) {
                // TODO: Display error message
                console.error(error, xhr, text);
            });
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