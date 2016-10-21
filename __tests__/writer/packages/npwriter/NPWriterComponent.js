import { Component, DocumentSession } from 'substance'
import NPWriterConfigurator from '../../../../writer/packages/npwriter/NPWriterConfigurator'
import AppPackage from '../../../../writer/AppPackage'
import Api from '../../../../writer/api/Api'
import sinon from 'sinon'
import Helper from '../../../helpers'
import UnsupportedPackage from '../../../../writer/packages/unsupported/UnsupportedPackage'
import NPWriterCompontent from '../../../../writer/packages/npwriter/NPWriterComponent'

class App extends Component {

    getChildContext() {
        return Object.assign({}, {
            configurator: this.props.configurator,
        });
    }


    render($$) {

        // MOCK
        window.document.createRange = () => {}

        let api = new Api({}, this.props.configurator)
        api.newsitem.newsItem = Helper.getParsedExampleDocument()

        this.props.configurator.import(UnsupportedPackage)
        var importer = this.props.configurator.createImporter('newsml')
        const idfDocument = importer.importDocument(Helper.getContentFromExampleDocument())
        let documentSession = new DocumentSession(idfDocument)

        let writer = $$(NPWriterCompontent, {
            documentSession: documentSession,
            configurator: this.props.configurator
        }).ref('writer')

        return $$('div').attr('id', 'main').append('hello')
                .append(writer)
    }

}

describe('Start a Writer', () => {

    it('Mounts a writer to document', () => {
        var configurator = new NPWriterConfigurator().import(AppPackage)
        App.mount({configurator: configurator}, document.body)

        expect(document.getElementById('main').nodeName).toBe('DIV')
        expect(document.getElementById('main').getAttribute('id')).toBe('main')
        expect(document.getElementsByClassName('sc-np-writer').length).toBe(1)


    })

})

