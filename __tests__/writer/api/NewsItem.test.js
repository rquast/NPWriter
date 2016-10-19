import Api from '../../../writer/api/Api'
import { ProseEditorConfigurator } from 'substance'
import Helper from '../../helpers'
import 'whatwg-fetch'
var fs = require('fs');


describe('Loads newsItem', () => {

    let api
    beforeEach(() => {
        var configuratorPackage = {
            configure: () => {}
        }

        const configurator = new ProseEditorConfigurator().import(configuratorPackage);
        api = new Api({}, configurator)

        api.newsitem.newsItem = Helper.getParsedExampleDocument()

    })

    it('Can use DOMDocument', () => {

    })

    it('Can reads GUID from NewsItem', () => {
        expect(api.newsitem.getGuid()).toBe(true)
    })



})
