import ValidationError from '../../utils/errors/ValidationError'
import FileUploadError from '../../utils/errors/FileUploadError'

class SaveHandler {

    constructor({editorSession, api, configurator}) {
        this.api = api
        this.editorSession = editorSession
        this.configurator = configurator
    }

    /**
     * Returns the newsItem after it has been processed by the exporter
     * @returns {*|String}
     */
    getExportedDocument() {
        const exporter = this.configurator.createExporter('newsml', {api: this.api})
        const exportedArticle = exporter.exportDocument(this.editorSession.getDocument(), this.api.newsItemArticle)

        return exportedArticle
    }


    /**
     *
     * Runs validate method on all provided validators
     *
     * @param {Array} validators - An array with Validators
     * @returns {Array} Messages - An array with messages objects
     * @throws Error - Error is thrown is the validator class doesn't have a validate method
     */
    runValidators(validators) {
        let messages = []
        validators.forEach((validatorClass) => {
            const pluginValidator = new validatorClass(this.api.newsItemArticle)
            if (pluginValidator.validate) {
                pluginValidator.validate()

                if (pluginValidator.hasMessages()) {
                    messages = [...messages, ...pluginValidator.getMessages()]
                }

            } else {
                throw new Error('Validator missing validate method')
            }
        })

        return messages
    }


    /**
     * Runs all validators and shows messages in a dialog
     * Promise is resolved if user clicks continue
     * Promise is rejected if user clicks cancel
     *
     * If no messages is found in the validators the promise is resolved immediately
     *
     * @returns {Promise}
     */
    validateDocument() {
        return new Promise((resolve, reject) => {
            const messages = this.runValidators(this.api.configurator.getValidators())

            if(messages.length === 0) {
                resolve()
                return
            }

            this.api.ui.showMessageDialog(messages,
                () => {
                    resolve()
                },
                () => {
                    reject(new ValidationError(messages))
                })
        })


    }

    /**
     * Saves the current document after run through the NewsML Exporter
     * The UUID is selected from the NewsItem DOM
     * @returns {*}
     */
    saveDocument() {

        this.validateDocument()
            .then(() => {
                this.editorSession.fileManager.sync()
            })
            .then(() => {

                const uuid = this.api.newsItemArticle.documentElement.getAttribute('guid');
                const exportedArticle = this.getExportedDocument()

                if (uuid) {
                    return this.updateNewsItem(uuid, exportedArticle)
                } else {
                    return this.createNewsItem(exportedArticle)
                }
            })
            .catch((error) => {

                if(error instanceof ValidationError) {
                    // User canceled the save when on validation errors
                    this.api.events.userActionCancelSave()
                } else if (error instanceof FileUploadError) {
                    this.api.events.documentSaveFailed(error)
                } else {
                    this.api.events.documentSaveFailed(error)
                }
                console.error(error)
            })
    }

    createNewsItem(newsItemXmlString) {
        return this.api.router.post('/api/newsitem', newsItemXmlString)
            .then(response => response.text())
            .then((uuid) => {

                // When creating a new article, fetch the newly created article from the
                // backend and replace the document

                this.api.router.get('/api/newsitem/' + uuid, {imType: 'x-im/article'})
                    .then(response => this.api.router.checkForOKStatus(response))
                    .then(response => response.text())
                    .then((xmlString) => {
                        const result = this.api.newsItem.setSource(xmlString, {})
                        this.api.browser.ignoreNextHashChange = true
                        this.api.browser.setHash(uuid)
                        this.api.app.replaceDoc(result)
                        this.api.events.documentSaved();
                    })
            })
            .catch((error) => {
                this.api.events.documentSaveFailed(error)
            });
    }

    updateNewsItem(uuid, newsItemXmlString) {
        return this.api.router.put('/api/newsitem/' + uuid, newsItemXmlString)
            .then((response) => this.api.router.checkForOKStatus(response))
            .then(() => {
                this.api.events.documentSaved();
            })
            .catch((error) => {
                this.api.events.documentSaveFailed(error)
            })
    }

}

export default SaveHandler
