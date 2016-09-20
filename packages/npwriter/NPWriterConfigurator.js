import { ProseEditorConfigurator } from 'substance'

class NPWriterConfigurator extends ProseEditorConfigurator {
  constructor(...args) {
    super(...args)
    // HACK: workaround when there is not overlay tool registered
    this.config.tools.set('overlay', new Map());
  }
}

export default NPWriterConfigurator