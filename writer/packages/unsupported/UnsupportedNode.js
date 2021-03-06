import {BlockNode} from 'substance'

class UnsupportedNode extends BlockNode {}

UnsupportedNode.type = 'unsupported';

UnsupportedNode.define({
  attributes: { type: 'object', default: {} },
  xmlContent: {type: 'string', default: ''},
  tagName: 'string',
  tagType: { type: 'string', optional: true}
})

export default UnsupportedNode
