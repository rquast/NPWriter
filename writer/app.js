import {Component, EditorSession} from 'substance'

import './styles/app.scss';


import NPWriterComponent from './packages/npwriter/NPWriterComponent'
import NPWriterConfigurator from './packages/npwriter/NPWriterConfigurator'
import AppPackage from './AppPackage'
import UnsupportedPackage from './packages/unsupported/UnsupportedPackage'
import PluginManager from './utils/PluginManager'
import API from './api/Api'
import Start from './packages/load-screens/Start'
import Error from './packages/load-screens/Error'
import SaveHandler from './packages/npwriter/SaveHandler'
import Event from './utils/Event'
import moment from 'moment'
import idGenerator from './utils/IdGenerator'
import APIManager from './api/APIManager'
import lodash from 'lodash'
import SourceComponent from './packages/dialog/SourceComponent'
import jxon from 'jxon'

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


    /**
     * Returns the saveHandler or create one if not created
     * @returns {SaveHandler}
     */
    getSaveHandler() {
        if(!this.saveHandler) {
            this.saveHandler = new SaveHandler({
                editorSession: this.editorSession,
                configurator: this.configurator,
                api: this.api
            })
        }
        return this.saveHandler
    }

    didMount() {
        document.onkeydown = this.handleApplicationKeyCombos.bind(this)

        this.configurator = new NPWriterConfigurator().import(AppPackage)

        this.APIManager = new APIManager()

        this.pluginManager = new PluginManager(this.configurator, this.APIManager)
        this.api = new API(this.pluginManager, this.configurator, this.APIManager)

        const api = this.api

        // Expose classes and endpoint on window.writer
        api.apiManager.expose('api', this.api)
        api.apiManager.expose('event', Event) // Expose the API on the window
        api.apiManager.expose('moment', moment) // Expose moment.js on window
        api.apiManager.expose('idGenerator', idGenerator) // Expose the ID Generator helper method
        api.apiManager.expose('lodash', lodash) // Expose the ID Generator helper method


        this.configurator.loadConfigJSON('/api/config')                     // Load config file and store it in configurator
            .then(() => this.configurator.config.writerConfigFile.plugins)  // Get the plugins section from config (stored in the configurator)
            .then(plugins => this.pluginManager.load(plugins))              // Let the pluginManger load and append the plugins
            .then(() => {

                api.router.get('/api/newsitem/' + this.getHash(), {imType: 'x-im/article'}) // Make request to fetch article
                    .then(response => api.router.checkForOKStatus(response))                // Check if the status is between 200 and 300
                    .then(response => response.text())                                      // Gets the text/xml in the response
                    .then((xmlStr) => {

                        this.addDefaultConfiguratorComponent()

                        var result = api.newsItem.setSource(xmlStr, {});


                        this.editorSession = new EditorSession(result.idfDocument, {
                            configurator: this.configurator,
                            lang: this.configurator.config.writerConfigFile.language,
                            context: {
                                api: this.api
                            }
                        })

                        // ATTENTION: we need to update the API as well to use the fresh editorSession
                        api.editorSession = this.editorSession

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
                    // .catch(this.handleError.bind(this));
            })
            .catch(this.handleError.bind(this));
    }


    /**
     * Handles errors from for instance plugin loading
     * @param error
     */
    handleError(error) {
        this.setState({
            status: STATUS_HAS_ERROR,
            statusMessage: error
        })
    }

    handleApplicationKeyCombos(e) {
        let handled = false;

        if (e.keyCode === 83 && (e.metaKey || e.ctrlKey)) { // Save: cmd+s
            this.api.newsItem.save()
            handled = true;
        } else if (e.keyCode === 85 && (e.metaKey || e.ctrlKey) && !e.altKey) {
            const xml = this.getSaveHandler().getExportedDocument()
            this.api.ui.showDialog(SourceComponent, {message: xml}, {title: 'Source', primary: 'Ok', secondary: false, takeover: true})

            handled = true;
        }

        if (handled) {
            e.preventDefault()
            e.stopPropagation()
        }

    }

    /**
     * Replace changes the current newsItem and creates and replaces the document session and then rerenders the writer
     * @param newsItem
     * @param idfDocument
     */
    replaceDoc({newsItemArticle, idfDocument}) {
        this.newsItemArticle = newsItemArticle;
        this.editorSession = new EditorSession(idfDocument, {
            configurator: this.configurator,
            lang: this.configurator.config.writerConfigFile.language,
            context: {
                api: this.api
            }
        })

        this.editorSession.saveHandler = this.getSaveHandler()
        this.api.init(newsItemArticle, this.editorSession, this.refs)

        this.rerender();
    }

    render($$) {
        var el = $$('div').addClass('sc-app').ref('app')

        switch (this.state.status) {

            case STATUS_HAS_ERROR:
                el.append($$(Error, {error: this.state.statusMessage}))
                break

            case STATUS_ISREADY:
                el.append($$(NPWriterComponent, {
                    pluginManager: this.pluginManager,
                    editorSession: this.editorSession,
                    configurator: this.configurator,
                    api: this.api
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

        this.configurator.addSidebarTab({id: 'main', name: 'Meta'})

    }
}


window.onload = () => {

    App.mount({}, document.body)
}
