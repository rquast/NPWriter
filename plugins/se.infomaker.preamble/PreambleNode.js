// ================ NODE
function Preamble() {
    Preamble.super.apply(this, arguments);
}

Writer.TextBlock.extend(Preamble);

Preamble.static.name = "preamble";

Preamble.static.defineSchema({
    "id": {type: 'string'}
});

export default Preamble