var fs = require('fs');
import {Component, EditorSession} from 'substance'
import Api from '../writer/api/Api'
import UnsupportedPackage from '../writer/packages/unsupported/UnsupportedPackage'
import NPWriterCompontent from '../writer/packages/npwriter/NPWriterComponent'

class Helper {

    static getContentFromExampleDocument() {
        return fs.readFileSync('data/newsitem-text.xml', {encoding: 'UTF-8'})
    }

    static getParsedExampleDocument() {
        let contents = Helper.getContentFromExampleDocument()
        var parser = new DOMParser();
        return parser.parseFromString(contents, "application/xml")
    }

    static getApp() {

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
                api.init(Helper.getParsedExampleDocument(), {getDocument:()=>{}}, {}) // Mocking documentSession parameter

                this.props.configurator.import(UnsupportedPackage)
                var importer = this.props.configurator.createImporter('newsml')
                const idfDocument = importer.importDocument(Helper.getContentFromExampleDocument())

                let editorSession = new EditorSession(idfDocument, {
                    configurator: this.props.configurator,
                    lang: "sv_SE",
                    context: {
                        api: api
                    }
                })

                let writer = $$(NPWriterCompontent, {
                    editorSession: editorSession,
                    configurator: this.props.configurator
                }).ref('writer')

                return $$('div').attr('id', 'main').append('hello')
                    .append(writer)
            }

        }
        return App
    }

}
export default Helper


it('is a helper', () => {

})