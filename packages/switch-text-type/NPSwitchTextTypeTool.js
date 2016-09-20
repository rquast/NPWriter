'use strict';

import { SwitchTextTypeTool } from 'substance'
import each from 'lodash/each'

class NPSwitchTextTypeTool extends SwitchTextTypeTool {
  render($$) {
    var el = $$("div").addClass('sc-np-switch-text-type');
    var Button = this.getComponent('button');

    each(this.props.textTypes, function(textType) {
        var btn = $$(Button, {
          label: textType.name,
          hint: 'ctrl+foo',
          active: textType.name === this.props.currentTextType.name,
          // disabled: this.props.disabled,
          style: 'plain-dark'
        }).on('click', this.handleClick)
          .attr('data-type', textType.name)

        el.append(btn);
    }.bind(this));

    return el;
  }
}

export default NPSwitchTextTypeTool
