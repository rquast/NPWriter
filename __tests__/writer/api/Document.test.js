import 'whatwg-fetch'
import Api from '../../../writer/api/Api'
import {EditorSession} from 'substance'
import NPWriterConfigurator from '../../../writer/packages/npwriter/NPWriterConfigurator'
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
        const configurator = new NPWriterConfigurator().import(AppPackage);
        api = new Api({}, configurator)

        let newsItem = Helper.getParsedExampleDocument()

        configurator.import(UnsupportedPackage)

        var importer = configurator.createImporter('newsml')
        let idfDocument = importer.importDocument(Helper.getContentFromExampleDocument())
        let editorSession = new EditorSession(idfDocument, {
            configurator: configurator,
            lang: "sv_SE",
            context: {
                api: api
            }
        })

        api.init(newsItem, editorSession, refs)

    })


    it('Gets a list of document nodes from document', () => {
        let nodes = api.editorSession.getDocument().getNodes()['body'].nodes;
        expect(nodes.length).toBe(17)
    })



})
