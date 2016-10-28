

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
            .then(response => response.text())
            .then((uuid) => {
                window.location.hash = uuid;
                this.api.events.onDocumentSaved();
            })
            .catch((error, xhr, text) => {
                console.log("e", error);
            });
    }

    updateNewsItem(uuid, newsItemXmlString) {
        return this.api.router.put('/api/newsitem/' + uuid, newsItemXmlString)
            .then((response) => {
                this.api.events.onDocumentSaved();
            })
            .catch((error, xhr, text) => {
                console.log("c",error, xhr, text);
            })
    }

}

export default SaveHandler