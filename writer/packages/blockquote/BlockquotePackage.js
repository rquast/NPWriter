import Blockquote from './Blockquote'
import BlockquoteComponent from './BlockquoteComponent'
import BlockquoteConverter from './BlockquoteConverter'

export default {
    name: 'blockquote',
    configure: function(config) {
        config.addNode(Blockquote)
        config.addComponent(Blockquote.type, BlockquoteComponent)
        config.addConverter('newsml', BlockquoteConverter)
        config.addTextType({
            name: 'blockquote',
            data: {type: 'blockquote'}
        })
        config.addLabel('blockquote', {
            en: 'Blockquote',
            de: 'Blockequote',
            sv: 'Citat'
        })
        config.addLabel('blockquote.content', {
            en: 'Blockequote',
            de: 'Blockequote',
            sv: "Citat"
        })
    }
};
