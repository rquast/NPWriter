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
import PluginManager from './utils/PluginManager';
class App extends Component {

    getInitialState() {
        return {
            isReady: false
        }
    }

    didMount() {

        const pluginManager = new PluginManager(this.props.configurator);

        pluginManager.getListOfPlugins()
            .then(plugins => {
                return pluginManager.load(plugins)
            })
            .then(() => {
                request('GET', './data/example.xml', null, (err, xmlString) => {
                    this.props.configurator.import(UnsupportedPackage)
                    var importer = this.props.configurator.createImporter('newsml')
                    this.doc = importer.importDocument(xmlString)
                    this.documentSession = new DocumentSession(this.doc)

                    this.setState({
                        isReady: true
                    })
                })
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
            el.append("Loading")
        }

        return el
    }
}


window.onload = () => {
    var configurator = new NPWriterConfigurator().import(AppPackage);
    App.mount({configurator: configurator}, document.body)
}
