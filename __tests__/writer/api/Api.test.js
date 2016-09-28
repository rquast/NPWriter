var fetch = require('node-fetch')
var fs = require('fs')
import Api from '../../../writer/api/Api'
import {ProseEditorConfigurator} from 'substance'
import PluginManager from '../../../writer/utils/PluginManager'

describe('Get config values for plugins', () => {

    let api, pluginManager

    beforeEach(() => {

        var configuratorPackage = {
            configure: () => {
            }
        }

        const configurator = new ProseEditorConfigurator().import(configuratorPackage);
        pluginManager = new PluginManager(configurator);

        api = new Api(pluginManager, configurator)

        let contents = fs.readFileSync('data/example.xml', {encoding: 'UTF-8'})
        var parser = new DOMParser();
        api.newsitem.newsItem = parser.parseFromString(contents, "application/xml")
    })

    it('Sets the newsItem', () => {
        expect(api.newsitem.newsItem).not.toBe(null)
    })


    it('Gets correct values for data through the API', () => {
        const plugin = {
            id: 'se.infomaker.dummy',
            name: 'dummy',
            configure: () => {
            }
        }

        setTimeout(() => {
            pluginManager.registerPlugin(plugin)
        }, 100)

        const pluginList = fs.readFileSync('data/plugins.json', {encoding: 'UTF-8'})
        return pluginManager.load(JSON.parse(pluginList)).then((_) => {
            expect(api.getConfigValue('se.infomaker.dummy', 'foo')).toBe('bar')
        })

    })

})