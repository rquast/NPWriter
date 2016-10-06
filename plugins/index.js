import Preamble from './se.infomaker.preamble/Preamble'
import TextAnalyzer from './se.infomaker.textanalyzer/index'



(() => {
    const {api, registerPlugin} = window.writer
    Preamble()
    TextAnalyzer(api, registerPlugin)

})()