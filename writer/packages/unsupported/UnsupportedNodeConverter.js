export default {

    type: 'unsupported',

    matchElement: function () {
        return true
    },


    import: function (el, node) {
        node.attributes = el.getAttributes()
        node.xmlContent = el.innerHTML
        node.tagName = el.tagName

        if(el.attr('type')) {
            node.tagType = el.attr('type')
        }

    },

    export: function (node, el) {
        el.tagName = node.tagName

        if (node.attributes) {
            Object.keys(node.attributes).forEach((key) => {
                el.setAttribute(key, node.attributes[key])
            })
        }
        el.innerHTML = node.xmlContent
        return el
    }

}
