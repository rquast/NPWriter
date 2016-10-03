export default {

  type: 'unsupported',

  matchElement: function() {
    return true
  },

  import: function(el, node) {
    node.xml = el.outerHTML
    node.dataType = el.attr('type')
  },

  export: function(node, el) {
    el.outerHTML = node.xml
    return el
  }

}
