'use strict';

import { Component, ContainerEditor } from 'substance'

class UnsupportedNodeComponent extends Component {
  render($$) {
    var node = this.props.node;
    var el = $$('div')
      .addClass('sc-unsupported-node')
        .attr('style', 'border: 1px solid #ccc; display:block')
      .attr('data-id', this.props.node.id);

    el.append('Unsupported Content' + this.props.node.dataType)
    return el;
  }
}

export default UnsupportedNodeComponent