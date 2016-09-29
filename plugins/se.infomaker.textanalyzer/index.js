(() => {
    const {TextBlock, Component, TextPropertyComponent} = substance
    const {api, registerPlugin} = writer

    class TextanalyzerComponent extends Component {

        constructor(...args) {
            super(...args)

            api.events.on('textanalyzer', 'document:changed', () => {
                console.log("Document is changes");
            })
        }

        render($$) {
            return $$('div')
                .addClass('sc-preamble')
                .append('Texten är här')
        }
    }


    const AnalyzerPackage = {
        name: 'textanalyzer',
        id: 'se.infomaker.textanalyzer',
        configure: function (config) {

            config.addSidebarTab({id: 'textanalyzer', name: 'Textanalys'})
            config.addToSidebar('se.infomaker.textanalyzer', 'textanalyzer', TextanalyzerComponent)
            config.addComponent('se.infomaker.textanalyzer', TextanalyzerComponent)
        }
    }

    if (registerPlugin) {
        registerPlugin(AnalyzerPackage)
    } else {
        console.log("Register method not yet available");
    }

})()


