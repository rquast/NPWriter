import Body from './Body'
import BodyConverter from './BodyConverter'
import BodyComponent from './BodyComponent'

export default {
    name: 'body',
    configure: function(config) {
        config.addNode(Body)
        config.addConverter('newsml', BodyConverter)
        config.addComponent('body', BodyComponent)
    }
}
