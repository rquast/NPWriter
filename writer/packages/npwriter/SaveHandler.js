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
        var exporter = this.configurator.createExporter('newsml')
        const exportedArticle = exporter.exportDocument(this.editorSession.getDocument(), this.api.newsItemArticle)

        return exportedArticle
    }

    /**
     * Saves the current document after run through the NewsML Exporter
     * The UUID is selected from the NewsItem DOM
     * @returns {*}
     */
    saveDocument() {
        const uuid = this.api.newsItemArticle.documentElement.getAttribute('guid');
        const exporter = this.configurator.createExporter('newsml')
        const exportedArticle = exporter.exportDocument(this.editorSession.getDocument(), this.api.newsItemArticle)

        this.editorSession.fileManager.sync()
        .then(() => {
            if(uuid) {
                return this.updateNewsItem(uuid, exportedArticle)
            } else {
                return this.createNewsItem(exportedArticle)
            }
        }).catch(function(error) {
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
                        this.api.refs.writer.parent.replaceDoc(result) //@TODO Fix this so we dont use parent
                        this.api.events.documentSaved();
                    })
            })
            .catch((error) => {
                this.api.events.documentSaveFailed(error)
            });
    }

    updateNewsItem(uuid, newsItemXmlString) {
        return this.api.router.put('/api/newsitem/' + uuid, newsItemXmlString)
            .then(() => {
                this.api.events.documentSaved();
            })
            .catch((error) => {
                this.api.events.documentSaveFailed(error)
            })
    }

}

export default SaveHandler
