import UnsupportedNodeConverter from './UnsupportedNodeConverter'

export default {

  type: 'unsupported-inline',

  matchElement: function() {
    return true;
  },

  import: UnsupportedNodeConverter.import,
  export: UnsupportedNodeConverter.export

}
