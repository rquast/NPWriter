export default {
    type: 'body',
    tagName: 'group',

    matchElement: function (el) {
        return el.is('group[type="body"]')
    },

    import: function (el, node, converter) {
        node.id = 'body'
        node.nodes = el.children.map(function (child) {
            var childNode = converter.convertElement(child)
            return childNode.id
        })
    },

    export: function (node, el, converter) {
        el.append(converter.convertNodes(node.nodes))
    }
}
