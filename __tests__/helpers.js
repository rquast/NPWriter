var fs = require('fs');
import {Component, EditorSession} from 'substance'
import Api from '../writer/api/Api'
import UnsupportedPackage from '../writer/packages/unsupported/UnsupportedPackage'
import NPWriterCompontent from '../writer/packages/npwriter/NPWriterComponent'
import NPWriterConfigurator from '../writer/packages/npwriter/NPWriterConfigurator'
import AppPackage from '../writer/AppPackage'

class Helper {

    static getContentFromExampleDocument() {
        return fs.readFileSync('data/newsitem-test.xml', {encoding: 'UTF-8'})
    }

    static getParsedExampleDocument() {
        let contents = Helper.getContentFromExampleDocument()
        var parser = new DOMParser();
        return parser.parseFromString(contents, "application/xml")
    }

    static getConfigurator() {
        return new NPWriterConfigurator().import(AppPackage)

    }

    static getApp(api) {

        class App extends Component {

            getChildContext() {
                return Object.assign({}, {
                    configurator: this.props.configurator,
                    api: api
                });
            }

            render($$) {
                // MOCK
                window.document.createRange = () => {}


                // this.props.configurator.import(UnsupportedPackage)
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
                    configurator: this.props.configurator,
                    api: api
                }).ref('writer')

                return $$('div').attr('id', 'main').ref('app').append(writer)
            }

        }
        return App
    }

}
export default Helper


it('is a helper', () => {

})