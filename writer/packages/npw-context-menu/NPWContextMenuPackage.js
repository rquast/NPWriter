import NPWContextMenu from './NPWContextMenu'

export default {
  name: 'context-menu',
  configure: function(config) {
    config.addComponent('npw-context-menu', NPWContextMenu)
  }
}
