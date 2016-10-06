export default () => {
    const {TextBlock, Component, TextPropertyComponent} = substance
    const { api, registerPlugin } = writer

    class PreambleNode extends TextBlock {
    }
    PreambleNode.type = 'preamble'
    PreambleNode.define({
        "id": {type: 'string'}
    })

    class PreambleComponent extends Component {
        render($$) {

            console.log("Config value", api.getConfigValue('se.infomaker.preamble', 'foo'))

            return $$('div')
                .addClass('sc-preamble')
                .attr('data-id', this.props.node.id)
                .append($$(TextPropertyComponent, {
                    path: [this.props.node.id, 'content']
                }));
        }
    }

    const PreambleConverter = {
        type: "preamble",
        tagName: "element",
        matchElement: function (el) {
            return el.is('element[type="preamble"]');
        },
        import: function (el, node, converter) {
            node.content = converter.annotatedText(el, [node.id, 'content']);
        },
        export: function (node, el, converter) {
            return el.attr('type', 'preamble')
                .append(converter.annotatedText([node.id, 'content']));
        }
    }

    const PreamblePackage = {
        name: 'preamble',
        id: 'se.infomaker.preamble',
        configure: function (config) {
            config.addNode(PreambleNode)
            config.addComponent(PreambleNode.type, PreambleComponent)
            config.addConverter('newsml', PreambleConverter)
            config.addTextType({
                name: 'preamble',
                data: {type: 'preamble'}
            })
            config.addLabel('preamble.content', {
                en: 'Preamble',
                sv: 'Ingress'
            })
        }
    }

    if (registerPlugin) {
        registerPlugin(PreamblePackage)
    } else {
        console.log("Register method not yet available");
    }

}


