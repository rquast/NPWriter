import Paragraph from './Paragraph'
import ParagraphComponent from './ParagraphComponent'
import ParagraphConverter from './ParagraphConverter'

export default {
    name: 'paragraph',
    configure: function(config) {
        config.addNode(Paragraph)
        config.addComponent(Paragraph.type, ParagraphComponent)
        config.addConverter('newsml', ParagraphConverter)
        config.addTextType({
            name: 'paragraph',
            data: {type: 'paragraph'}
        })
        config.addLabel('paragraph', {
            en: 'Paragraph',
            de: 'Paragraph'
        })
        config.addLabel('paragraph.content', {
            en: 'Paragraph',
            de: 'Paragraph'
        })
    }
};
