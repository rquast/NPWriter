class Validator {

    constructor(newsItemArticle) {
        this.newsItem = newsItemArticle
        this.messages = []
    }

    addError(error) {
        this.messages.push({type: 'error', message: error})
    }

    addWarning(warning) {
        this.messages.push({type: 'warning', message: warning})
    }

    addInfo(info) {
        this.messages.push({type: 'info', message: info})
    }

    hasMessages() {
        return this.messages.length > 0
    }
    getMessages() {
        return this.messages
    }

}

export default Validator