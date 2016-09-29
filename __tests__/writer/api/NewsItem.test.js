var fetch = require('node-fetch')
import Api from '../../../writer/api/Api'
import { ProseEditorConfigurator } from 'substance'
var fs = require('fs');


describe('Loads newsItem', () => {

    let api
    beforeEach(() => {
        var configuratorPackage = {
            configure: () => {}
        }

        const configurator = new ProseEditorConfigurator().import(configuratorPackage);
        api = new Api({}, configurator)

        let contents = fs.readFileSync('data/example.xml', {encoding: 'UTF-8'})
        var parser = new DOMParser();
        api.newsitem.newsItem = parser.parseFromString(contents, "application/xml")

    })

    it('Can use DOMDocument', () => {

    })

    it('Can reads GUID from NewsItem', () => {
        expect(api.newsitem.getGuid()).toBe(true)
    })

})
