import {
    Component,
    DocumentSession
} from 'substance'

// import 'writer/styles/app.scss'

import NPWriterCompontent from './packages/npwriter/NPWriterComponent'
import NPWriterConfigurator from './packages/npwriter/NPWriterConfigurator'
import AppPackage from './AppPackage'
import UnsupportedPackage from './packages/unsupported/UnsupportedPackage'
import PluginManager from './utils/PluginManager'
import API from './api/Api'

class App extends Component {

    constructor(...args) {
        super(...args)

        this.handleActions({
            validate: () => {
                console.log("Implement Validation");
            }, //this.validate
            save: () => {
                console.log("Implement save action");
            }, //this.save,
            replacedoc: this.replaceDoc
        });
    }

    getInitialState() {
        return {
            isReady: false
        }
    }

    didMount() {

        const pluginManager = new PluginManager(this.props.configurator);
        const api = new API(pluginManager, this.props.configurator)
        this.api = api
        window.writer.api = api

        pluginManager.getListOfPlugins('http://127.0.0.1:5000/api/plugins')
            .then(plugins => pluginManager.load(plugins))
            .then(() => {

                api.router.get('/api/newsitem/' + api.browser.getHash(), {imType: 'x-im/article'})
                    .then(response =>response.text())
                    .then((xmlStr) => {

                        // Adds package for unsupported elements in document
                        this.props.configurator.import(UnsupportedPackage)

                        var importer = this.props.configurator.createImporter('newsml')
                        this.idfDocument = importer.importDocument(xmlStr)
                        this.documentSession = new DocumentSession(this.idfDocument)

                        var result = api.newsitem.setSource(xmlStr, {});
                        this.replaceDoc(result);

                        // Clear guid if hash is empty
                        if (!api.browser.getHash()) {
                            api.setGuid(null);
                            api.removeDocumentURI();
                        }

                        this.setState({
                            isReady: true
                        })
                    })
            })
            .catch((error) => {
                console.log("Message", error);
            });
    }


    replaceDoc({newsItem, idfDocument}) {
        console.log("Replace doc");
        this.idfDocument = idfDocument;
        this.newsItem = newsItem;
        this.rerender();
    }

    render($$) {
        var el = $$('div').addClass('sc-app').ref('app')
        if (this.state.isReady) {

            this.api.init(this.newsItem, this.doc, this.refs);

            el.append($$(NPWriterCompontent, {
                documentSession: this.documentSession,
                configurator: this.props.configurator
            }).ref('writer'))


        } else {
            el.append("Loading...")
        }
        return el
    }
}


window.onload = () => {
    var configurator = new NPWriterConfigurator().import(AppPackage);
    App.mount({configurator: configurator}, document.body)
}
