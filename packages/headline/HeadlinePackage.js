import Headline from './Headline'
import HeadlineComponent from './HeadlineComponent'
import HeadlineConverter from './HeadlineConverter'

export default {
    name: 'paragraph',
    configure: function(config) {
        config.addNode(Headline)
        config.addComponent(Headline.type, HeadlineComponent)
        config.addConverter('newsml', HeadlineConverter)
        config.addTextType({
            name: 'headline',
            data: {type: 'Headline'}
        })
        config.addLabel('headline.content', {
            en: 'Headline',
            de: 'Headline',
            sv: 'Rubrik'
        })
    }
};
