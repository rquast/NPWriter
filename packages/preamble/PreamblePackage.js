import PreambleNode from './PreambleNode'
import PreambleComponent from './PreambleComponent'
import PreambleConverter from './PreambleConverter'

export default {
    name: 'paragraph',
    configure: function(config) {
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
