/**
 * APIManager manages wich endpoints available under the window.writer scope
 */
class APIManager {

    constructor() {
        this.endpoints = new Map()
        window.writer = {}
    }

    expose(name, apiClass) {

        if(this.endpoints.get(name)) {
            throw new Error('Error, Already registered')
        }

        console.info(`Registering window.writer.${name}`)
        this.endpoints.set(name, apiClass)
        window.writer[name] = apiClass
    }

}

export default APIManager