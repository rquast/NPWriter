import {ProseEditorOverlayTools} from 'substance'

class NPWriterOverlayTools extends ProseEditorOverlayTools {

  /*
    Button style for default Substance tools.

    You can change it to e.g. 'npwriter' to define your own
    style/theme scope.
  */
  getStyle() {
    return 'outline-dark'
  }

  /*
    Change this to 'np-writer-overlay-tools' and come up with
    your own styles instead of using the prose-editor dark styles
  */
  getClassNames() {
    return 'sc-prose-editor-overlay-tools'
  }
}

export default NPWriterOverlayTools
