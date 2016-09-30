var fs = require('fs');

class Helper {

    static getContentFromExampleDocument() {
        return fs.readFileSync('data/example.xml', {encoding: 'UTF-8'})
    }

    static getParsedExampleDocument() {
        let contents = Helper.getContentFromExampleDocument()
        var parser = new DOMParser();
        return parser.parseFromString(contents, "application/xml")
    }

}
export default Helper


it('is a helper', () => {

})