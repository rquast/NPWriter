import {Document} from 'substance'

/**
  NewsMLDocument (document) implementation
*/
class NewsMLDocument extends Document {

    constructor(...args) {
        super(...args)

        this.pluginManager = null
        this.xmlDocument = null

    }

}

export default NewsMLDocument
