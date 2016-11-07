import Subheadline from './Subheadline'
import SubheadlineComponent from './SubheadlineComponent'
import SubheadlineConverter from './SubheadlineConverter'

export default {
    name: 'paragraph',
    configure: function(config) {
        config.addNode(Subheadline)
        config.addComponent(Subheadline.type, SubheadlineComponent)
        config.addConverter('newsml', SubheadlineConverter)
        config.addTextType({
            name: 'subheadline',
            data: {type: 'subheadline'}
        })

        config.addLabel('subheadline', {
            en: 'Subheadline',
            de: 'Subheadline',
            sv: 'Underrubrik'
        })
        config.addLabel('subheadline.content', {
            en: 'Subheadline',
            de: 'Subheadline',
            sv: 'Underrubrikrik'
        })
    }
}
