import ConfigEditorComponent from './ConfigEditorComponent'

export default {
    name: 'config-editor',
    configure: function(config) {

        config.addSidebarTab({id: 'config', name: 'Konfigurera'})

        config.addComponentToSidebarWithTabId('config-editor', 'config', ConfigEditorComponent)
    }
};
