

class SaveHandler {

    constructor({editorSession, api, configurator}) {
        this.api = api
        this.editorSession = editorSession
        this.configurator = configurator
    }

    saveDocument() {

        let uuid = this.api.newsItemArticle.documentElement.getAttribute('guid');

        var exporter = this.configurator.createExporter('newsml')
        const exportedArticle = exporter.exportDocument(this.editorSession.getDocument(), this.api.newsItemArticle)

        if(uuid) {
            return this.updateNewsItem(uuid, exportedArticle)
        } else {
            this.createNewsItem(exportedArticle)
        }
    }

    createNewsItem(newsItemXmlString) {
        return this.api.router.post('/api/newsitem', newsItemXmlString)
            .done(function (uuid) {
                window.location.hash = uuid;
                this.api.events.onDocumentSaved();
            }.bind(this))
            .error(function (error, xhr, text) {
                console.log("e", error);
            }.bind(this));
    }

    updateNewsItem(uuid, newsItemXmlString) {
        return this.api.router.put('/api/newsitem/' + uuid, newsItemXmlString)
            .then((response) => {
                console.log("Response", response);
                this.api.events.onDocumentSaved();
            })
            .catch((error, xhr, text) => {
                console.log("c",error, xhr, text);
            })
    }

}

export default SaveHandler