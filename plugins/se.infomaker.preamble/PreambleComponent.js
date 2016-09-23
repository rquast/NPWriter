const { Component, TextProperty } = Writer

function PreambleComponent() {
    Component.apply(this, arguments);
}

PreambleComponent.Prototype = function () {

    this.render = function () {
        return Component.$$('div')
            .addClass('sc-preamble')
            .attr('data-id', this.props.node.id)
            .append(Component.$$(TextProperty, {
                path: [this.props.node.id, 'content']
            }));
    };
};
Component.extend(PreambleComponent);


export default PreambleComponent;