import Api from '../../../writer/api/Api'
import {ProseEditorConfigurator} from 'substance'
import PluginManager from '../../../writer/utils/PluginManager'
import sinon from 'sinon'

describe('Get config values for plugins', () => {

    let api, pluginManager

    beforeEach(() => {
        var configuratorPackage = { configure: () => { }}
        const configurator = new ProseEditorConfigurator().import(configuratorPackage);
        pluginManager = new PluginManager(configurator);

        api = new Api(pluginManager, configurator)

        // let contents = fs.readFileSync('data/example.xml', {encoding: 'UTF-8'})
        // var parser = new DOMParser();
        // api.newsitem.newsItem = parser.parseFromString(contents, "application/xml")
    })


    it('Adds an event listener', () => {
        expect(api.events.eventListeners.length).toBe(0)
        api.events.on('dummy', 'test:Executed', () => {})
        expect(api.events.eventListeners.length).toBe(1)
    })


    it('Removes an event listener', () => {
        api.events.on('dummy', 'test:Executed', () => {})
        expect(api.events.eventListeners.length).toBe(1)
        api.events.off('dummy', 'test:Executed')
        expect(api.events.eventListeners.length).toBe(0)
    })

    it('Triggers an event', () => {
        var callback = sinon.spy();

        api.events.on('dummy', 'test:Executed', callback)
        expect(api.events.eventListeners.length).toBe(1)

        api.events.triggerEvent('_', 'test:Executed', {})

        expect(callback.called).toBe(true)
    })


})