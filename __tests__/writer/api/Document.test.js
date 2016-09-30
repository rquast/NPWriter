var fetch = require('node-fetch')
import Api from '../../../writer/api/Api'
import { ProseEditorConfigurator } from 'substance'
import AppPackage from '../../../writer/AppPackage'
import UnsupportedPackage from '../../../writer/packages/unsupported/UnsupportedPackage'
import Helper from '../../helpers'

var fs = require('fs');


describe('Loads newsItem', () => {

    let api,
        refs = {
            writer: {

            }
        }
    beforeEach(() => {
        const configurator = new ProseEditorConfigurator().import(AppPackage);
        api = new Api({}, configurator)

        let newsItem = Helper.getParsedExampleDocument()

        configurator.import(UnsupportedPackage)

        var importer = configurator.createImporter('newsml')
        let idfDocument = importer.importDocument(Helper.getContentFromExampleDocument())

        api.init(newsItem, idfDocument, refs)

    })


    it('Gets a list of document nodes from document', () => {

        // console.log("API", api.doc);
        expect(api.document.getDocumentNodes().length).toBe(17)
    })



})
