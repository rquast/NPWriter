import Api from '../../../writer/api/Api'
import NPWriterConfigurator from '../../../writer/packages/npwriter/NPWriterConfigurator'
import Helper from '../../helpers'
import 'whatwg-fetch'
var fs = require('fs');


describe('Loads newsItem', () => {

    let api
    beforeEach(() => {
        var configuratorPackage = {
            configure: () => {}
        }

        const configurator = new NPWriterConfigurator().import(configuratorPackage);
        api = new Api({}, configurator)
        api.init(Helper.getParsedExampleDocument(), {getDocument:()=>{}}, {})

    })

    it('Can use DOMDocument', () => {

    })

    it('Can reads GUID from NewsItem', () => {
        expect(api.newsItem.getGuid()).toBe(true)
    })



})
