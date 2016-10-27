

class SaveHandler {

    constructor({editorSession, api, configurator}) {
        this.api = api
        this.editorSession = editorSession
        this.configurator = configurator
    }

    saveDocument(doc, changes, callback) {

        console.log("Save document", doc, changes, callback);

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