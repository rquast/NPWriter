class Validator {

    constructor() {
        console.log("Construct call");
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

    hasErrors() {
        return this.messages.length > 0
    }

}

export default Validator