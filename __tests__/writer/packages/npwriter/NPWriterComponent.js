import { Component, EditorSession } from 'substance'
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
            api: this.api
        });
    }

    render($$) {

        // MOCK
        window.document.createRange = () => {}

        this.api = new Api({}, this.props.configurator)
        this.api.init(Helper.getParsedExampleDocument(), {getDocument:()=>{}}, {}) // Mocking documentSession parameter

        let context = {
            api: this.api
        }

        // this.props.configurator.import(UnsupportedPackage)
        var importer = this.props.configurator.createImporter('newsml', context)
        const idfDocument = importer.importDocument(Helper.getContentFromExampleDocument())

        let editorSession = new EditorSession(idfDocument, {
            configurator: this.props.configurator,
            lang: "sv_SE",
            context: context
        })

        let writer = $$(NPWriterCompontent, {
            editorSession: editorSession,
            configurator: this.props.configurator,
            api: this.api
        }).ref('writer')

        return $$('div').attr('id', 'main').append('hello')
                .append(writer)
    }

}

describe('Start a Writer', () => {

    let xhr, requests
    beforeEach(() => {

        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function (req) { requests.push(req); };

    })

    afterEach(() => {
        xhr.restore();
    })

    it('Mounts a writer to document', () => {
        var configurator = new NPWriterConfigurator().import(AppPackage)
        App.mount({configurator: configurator}, document.body)

        expect(document.getElementById('main').nodeName).toBe('DIV')
        expect(document.getElementById('main').getAttribute('id')).toBe('main')
        expect(document.getElementsByClassName('sc-np-writer').length).toBe(1)


    })

})

