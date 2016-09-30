import {BlockNode} from 'substance'

class UnsupportedNode extends BlockNode {}

UnsupportedNode.type = 'unsupported';

UnsupportedNode.define({
  xml: {type: 'string', default: ''}
})

export default UnsupportedNode
