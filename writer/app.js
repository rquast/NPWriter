import {
    Component,
    DocumentSession
} from 'substance'

import './styles/app.scss';


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
            configurator: this.configurator,
            pluginManager: this.pluginManager,
            api: this.api
        });
    }


    didMount() {

        this.configurator = new NPWriterConfigurator().import(AppPackage)

        this.pluginManager = new PluginManager(this.configurator);
        this.api = new API(this.pluginManager, this.configurator)
        const api = this.api

        window.writer.api = this.api

        // setTimeout(() => {
        //     console.log("Add tab");
        //     this.configurator.addSidebarTab({id: 'related', name: 'Relatera'})
        //     this.rerender()
        // }, 3000)

        this.pluginManager.getListOfPlugins('/api/config')
            .then(plugins => this.pluginManager.load(plugins))
            .then(() => {
                api.router.get('/api/newsitem/' + api.browser.getHash(), {imType: 'x-im/article'})
                    .then(response => api.router.checkForOKStatus(response) )
                    .then(response => response.text())
                    .then((xmlStr) => {

                        // Adds package for unsupported elements in document
                        this.configurator.import(UnsupportedPackage)

                        this.configurator.addSidebarTab({id: 'related', name: 'Relatera'})
                        this.configurator.addSidebarTab({id: 'information', name: 'Information'})
                        this.configurator.addSidebarTab({id: 'main', name: 'Meta'})

                        var importer = this.configurator.createImporter('newsml')
                        const idfDocument = importer.importDocument(xmlStr)
                        this.documentSession = new DocumentSession(idfDocument)

                        var result = api.newsitem.setSource(xmlStr, {});
                        this.replaceDoc(result);

                        // Clear guid if hash is empty
                        if (!api.browser.getHash()) {
                            api.newsItem.setGuid(null);
                            api.newsItem.removeDocumentURI();
                        }

                        this.setState({
                            status: STATUS_ISREADY
                        })
                    })
                    // .catch((error) => {
                        // this.setState({
                        //     status: STATUS_HAS_ERROR,
                        //     statusMessage: error
                        // })
                    // });
            })
            .catch((error) => {
                this.setState({
                    status: STATUS_HAS_ERROR,
                    statusMessage: error
                })
            });
    }


    /**
     * Replace changes the current newsItem and creates and replaces the document session and then rerenders the writer
     * @param newsItem
     * @param idfDocument
     */
    replaceDoc({newsItem, idfDocument}) {
        this.newsItem = newsItem;
        this.documentSession = new DocumentSession(idfDocument)
        this.rerender();
    }

    render($$) {
        console.log("Render");
        var el = $$('div').addClass('sc-app').ref('app')

        switch (this.state.status) {

            case STATUS_HAS_ERROR:
                el.append($$(Error, {error: this.state.statusMessage}))
                break

            case STATUS_ISREADY:
                this.api.init(this.newsItem, this.documentSession, this.refs)

                el.append($$(NPWriterCompontent, {
                    pluginManager: this.pluginManager,
                    documentSession: this.documentSession,
                    configurator: this.configurator
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

    App.mount({}, document.body)
}
