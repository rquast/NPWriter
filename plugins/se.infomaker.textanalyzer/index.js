(() => {
    const {TextBlock, Component, TextPropertyComponent} = substance
    const {api, registerPlugin} = writer

    class TextanalyzerComponent extends Component {

        constructor(...args) {
            super(...args)

            api.events.on('textanalyzer', 'document:changed', (data) => {
                this.documentChanged(data)
            })
        }

        render($$) {
            return $$('div')
                .addClass('sc-preamble')
                .append('Texten är här')
        }

        getCount() {
            var nodes = api.document.getDocumentNodes();
            var textContent = "";
            nodes.forEach(function (node) {
                if (node.content) {
                    textContent += node.content.trim();
                }
            });
            var words = textContent.split(/\s+/);
            var textLength = textContent.length;

            return {
                words: words.length,
                textLength: textLength
            };
        }

        documentChanged(data) {
            // console.log("Change", data);

            var count = this.getCount()
            console.log("Count", count);
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


