import {DragAndDropHandler} from 'substance'

class NPWriterDragAndDropHandler extends DragAndDropHandler {

  drop(params, context) {
    let surface = params.target.surface
    context.api.drop.handleDrop(surface, params.event, null, context)
  }

}

export default NPWriterDragAndDropHandler