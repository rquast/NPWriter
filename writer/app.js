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
     * Added objects is reachable from this.context in children
     * @returns {*}
     */
    getChildContext() {
        return Object.assign({}, {
            configurator: this.configurator,
            pluginManager: this.pluginManager,
            api: this.api
        });
    }


    /**
     * If no ID is available in browser hash,
     * check if there is a specified id in the config file
     *
     * @returns {string} hash
     * @throws Error
     */
    getHash() {
        let hash = this.api.browser.getHash();
        if (!hash) {
            if (this.configurator.getNewsItemTemplateId()) {
                hash = this.configurator.getNewsItemTemplateId()
            } else {
                throw new Error('No template was found')
            }
        }
        return hash
    }

    didMount() {

        this.configurator = new NPWriterConfigurator().import(AppPackage)

        this.pluginManager = new PluginManager(this.configurator);
        this.api = new API(this.pluginManager, this.configurator)
        const api = this.api

        window.writer.api = this.api // Expose the API on the window

        this.configurator.loadConfigJSON('/api/config')                     // Load config file and store it in configurator
            .then(() => this.configurator.config.writerConfigFile.plugins)  // Get the plugins section from config (stored in the configurator)
            .then(plugins => this.pluginManager.load(plugins))              // Let the pluginManger load and append the plugins
            .then(() => {

                api.router.get('/api/newsitem/' + this.getHash(), {imType: 'x-im/article'}) // Make request to fetch article
                    .then(response => api.router.checkForOKStatus(response))                // Check if the status is between 200 and 300
                    .then(response => response.text())                                      // Gets the text/xml in the response
                    .then((xmlStr) => {

                        this.addDefaultConfiguratorComponent()

                        var importer = this.configurator.createImporter('newsml')
                        const idfDocument = importer.importDocument(xmlStr)
                        this.documentSession = new DocumentSession(idfDocument)

                        var result = api.newsItem.setSource(xmlStr, {});
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
                    .catch((error) => {
                        console.error("ERROR", error);
                        this.setState({
                            status: STATUS_HAS_ERROR,
                            statusMessage: error
                        })
                    });
            })
            .catch((error) => {
                console.error("ERROR", error);
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
    replaceDoc({newsItemArticle, idfDocument}) {
        this.newsItemArticle = newsItemArticle;
        this.documentSession = new DocumentSession(idfDocument)

        this.api.init(newsItemArticle, this.documentSession, this.refs)

        this.rerender();
    }

    render($$) {
        var el = $$('div').addClass('sc-app').ref('app')

        switch (this.state.status) {

            case STATUS_HAS_ERROR:
                el.append($$(Error, {error: this.state.statusMessage}))
                break

            case STATUS_ISREADY:


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

    /**
     * Adds a couple of defaults component to our configurator
     */
    addDefaultConfiguratorComponent() {
        // Adds package for unsupported elements in document
        this.configurator.import(UnsupportedPackage)

        this.configurator.addSidebarTab({id: 'related', name: 'Relatera'})
        this.configurator.addSidebarTab({id: 'information', name: 'Information'})
        this.configurator.addSidebarTab({id: 'main', name: 'Meta'})

    }
}


window.onload = () => {

    App.mount({}, document.body)
}
