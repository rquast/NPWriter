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
import Start from './packages/load-screens/Start'
import Error from './packages/load-screens/Error'

const STATUS_ISREADY = 'isReady',
    STATUS_LOADING = 'loading',
    STATUS_HAS_ERROR = 'hasErrors'

class App extends Component {

    constructor(...args) {
        super(...args)

        this.pluginManager = null
        this.api = null

        this.handleActions({
            validate: () => {
                console.log("Implement Validation")
            }, //this.validate
            save: () => {
                console.log("Implement save action")
            }, //this.save,
            replacedoc: this.replaceDoc
        });
    }

    getInitialState() {
        return {
            status: STATUS_LOADING
        }
    }

    /**
     * A Dependency injection mechanism
     * Added objects is reachable from this.context
     * @returns {*}
     */
    getChildContext() {
        return Object.assign({}, {
            configurator: this.props.configurator,
            pluginManager: this.pluginManager,
            api: this.api
        });
    }

    didMount() {

        this.pluginManager = new PluginManager(this.props.configurator);
        this.api = new API(this.pluginManager, this.props.configurator)
        const api = this.api

        window.writer.api = this.api

        this.pluginManager.getListOfPlugins('/api/config')
            .then(plugins => this.pluginManager.load(plugins))
            .then(() => {
                api.router.get('/api/newsitem/' + api.browser.getHash(), {imType: 'x-im/article'})
                    .then(response =>response.text())
                    .then((xmlStr) => {

                        // Adds package for unsupported elements in document
                        this.props.configurator.import(UnsupportedPackage)

                        this.props.configurator.addSidebarTab({id: 'related', name: 'Relatera'})
                        this.props.configurator.addSidebarTab({id: 'information', name: 'Information'})
                        this.props.configurator.addSidebarTab({id: 'main-panel', name: 'Meta'})

                        var importer = this.props.configurator.createImporter('newsml')
                        const idfDocument = importer.importDocument(xmlStr)
                        this.documentSession = new DocumentSession(idfDocument)

                        var result = api.newsitem.setSource(xmlStr, {});
                        this.replaceDoc(result);

                        // Clear guid if hash is empty
                        if (!api.browser.getHash()) {
                            api.setGuid(null);
                            api.removeDocumentURI();
                        }

                        this.setState({
                            status: STATUS_ISREADY
                        })
                    })
                    .catch((error) => {
                        this.setState({
                            status: STATUS_HAS_ERROR,
                            statusMessage: error
                        })
                    });
            })
            .catch((error) => {
                this.setState({
                    status: STATUS_HAS_ERROR,
                    statusMessage: error
                })
            });
    }


    replaceDoc({newsItem, idfDocument}) {
        this.newsItem = newsItem;
        this.rerender();
    }

    render($$) {
        var el = $$('div').addClass('sc-app').ref('app')

        switch (this.state.status) {

            case STATUS_HAS_ERROR:
                el.append($$(Error, {error: this.state.statusMessage}))
                break

            case STATUS_ISREADY:
                this.api.init(this.newsItem, this.documentSession, this.refs)

                el.append($$(NPWriterCompontent, {
                    documentSession: this.documentSession,
                    configurator: this.props.configurator
                }).ref('writer'))
                break

            case STATUS_LOADING:
            default:
                el.append($$(Start, {}))
        }
        return el
    }
}


window.onload = () => {
    var configurator = new NPWriterConfigurator().import(AppPackage)
    App.mount({configurator: configurator}, document.body)
}
