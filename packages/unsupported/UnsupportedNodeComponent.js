'use strict';

import { Component, ContainerEditor } from 'substance'

class UnsupportedNodeComponent extends Component {
  render($$) {
    var node = this.props.node;
    var el = $$('div')
      .addClass('sc-unsupported-node')
      .attr('data-id', this.props.node.id);

    el.append('Unsupported Content')
    return el;
  }
}

export default UnsupportedNodeComponent