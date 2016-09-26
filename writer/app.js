import {
    Component,
    DocumentSession,
    request
} from 'substance'

import 'writer/styles/app.scss'

import NPWriterCompontent from './packages/npwriter/NPWriterComponent'
import NPWriterConfigurator from './packages/npwriter/NPWriterConfigurator'
import AppPackage from './AppPackage'
import UnsupportedPackage from './packages/unsupported/UnsupportedPackage'
import PluginManager from './utils/PluginManager'
import API from './api/Api'

class App extends Component {

    getInitialState() {
        return {
            isReady: false
        }
    }

    didMount() {

        const pluginManager = new PluginManager(this.props.configurator);
        const api = new API(pluginManager, this.props.configurator)

        window.writer = api

        pluginManager.getListOfPlugins()
            .then(plugins => pluginManager.load(plugins))
            .then(() => {

                api.router.get('/api/newsitem/' + api.browser.getHash(), {imType:'x-im/article'})
                    .then((response) => {
                        return response.text()
                    })
                    .then((xmlStr) => {

                        // console.log("Got document", xmlStr);
                        // var result = api.newsitem.setSource(xmlStr, this.writerConfig);
                        // this.replaceDoc(result);

                        // Clear guid if hash is empty
                        if (!api.browser.getHash()) {
                            api.setGuid(null);
                            api.removeDocumentURI();
                        }

                        this.props.configurator.import(UnsupportedPackage)
                        var importer = this.props.configurator.createImporter('newsml')
                        this.doc = importer.importDocument(xmlStr)
                        this.documentSession = new DocumentSession(this.doc)

                        this.setState({
                            isReady: true
                        })

                    })
                    .catch(function (error, xhr, text) {
                        console.error(error, xhr, text);
                    });


            })
            .catch((error) => {
                console.log("Message", error);
            });
    }

    render($$) {
        var el = $$('div').addClass('sc-app')
        if (this.state.isReady) {
            el.append($$(NPWriterCompontent, {
                documentSession: this.documentSession,
                configurator: this.props.configurator
            }))
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
