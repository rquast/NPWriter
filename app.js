import {
  Component,
  DocumentSession,
  request
} from 'substance'

import NPWriter from './packages/npwriter/NPWriter'
import NPWriterConfigurator from './packages/npwriter/NPWriterConfigurator'
import AppPackage from './AppPackage'

class App extends Component {
  render($$) {
    var el = $$('div').addClass('sc-app')
    el.append($$(NPWriter, {
      documentSession: this.props.documentSession,
      configurator: this.props.configurator
    }))
    return el
  }
}



var configurator = new NPWriterConfigurator().import(AppPackage);
window.onload = function() {

    request('GET', './data/example.xml', null, function(err, xmlString) {
        var importer = configurator.createImporter('newsml');
        var doc = importer.importDocument(xmlString);
        var documentSession = new DocumentSession(doc);

        App.mount({
          documentSession: documentSession,
          configurator: configurator
        }, document.body)

        console.log('doc', doc);
    })

};
