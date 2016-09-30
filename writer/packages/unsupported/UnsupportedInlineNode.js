import {InlineNode} from 'substance'

class UnsupportedInlineNode extends InlineNode {}

UnsupportedInlineNode.type = 'unsupported-inline';

UnsupportedInlineNode.define({
  xml: {type: 'string', default: ''}
});

export default UnsupportedInlineNode;
