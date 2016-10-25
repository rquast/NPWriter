class NPWriterDragAndDropHandler {

  dragStart(params, context) {
    console.log('NPWriterDragAndDropHandler.dragStart', params, context)
  }

  drop(params, context) {
    console.log('NPWriterDragAndDropHandler.drop', params, context)
  }

  dragEnd(params, context) {
    console.log('NPWriterDragAndDropHandler.dragEnd', params, context)
  }

}

NPWriterDragAndDropHandler.prototype._isDragAndDropHandler = true

export default NPWriterDragAndDropHandler