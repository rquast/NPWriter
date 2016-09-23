import { TextBlock } from 'substance'

class Preamble extends TextBlock {}

Preamble.type = 'preamble'
Preamble.define({
    "id": { type: 'string' }
})

export default Preamble;