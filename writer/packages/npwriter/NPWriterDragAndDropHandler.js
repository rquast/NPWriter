import {DragAndDropHandler} from 'substance'
import forEach from 'lodash'

class NPWriterDragAndDropHandler extends DragAndDropHandler {

    drop(params, context) {
        // debugger
        console.info('##################################################')
        if (params.source) {
            console.info('  There is "params.source" so this is a node being dragged')
            console.info('  params.source:', params.source)
        } else {
            console.info('  Dropped something from external. Look at "params.data" or the raw event "params.event"')
            console.info('  params.data:', params.data)
            console.info('  params.event:', params.event)
        }
        console.info('  Look at "params.target" to find information about the drop target')
        console.info('  params.target:', params.target)
        console.info('')

        // TODO: Cover the following cases:
        // 1. MOVE CONTAINER NODE
        // 2. DROP EXTERNAL CONTENT
        // if (MOVE) {

        // } else if (DROP_EXTERNAL) {
        //     // files..
        //     this.api.handleFileDrop()
        //     this.api.handleUriDrop()
        // }

        if (params.source) {
            if (params.source._isComponent && params.target.node) {
                let sourceNode = params.source.props.node
                let targetNode = params.target.node
                if (sourceNode && targetNode) {
                    // MOVE NODE OPERATION!
                    console.log('MOVE NODE OPERATION!')
                    console.info('  dropped %s (=%s) onto %s (=%s)', sourceNode.id, sourceNode.type, targetNode.id, targetNode.type)
                }
            }
        } else {
            console.log('EXTERNAL DROP OPERATION')
            console.info('##################################################')
            let surface = params.target.surface
            // context.api.drop.handleDrop(surface, params.event, null, context)
        }


    }

}

export default NPWriterDragAndDropHandler