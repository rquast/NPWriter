import {FileNode} from 'substance'

class NPFileNode extends FileNode {}

NPFileNode.type = 'npfile'
NPFileNode.define({
    uuid: { type: 'string', optional: true },
    url: { type: 'string', optional: true },
    data: { type: 'object', optional: true }
})

export default NPFileNode
