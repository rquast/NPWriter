/**
 * Utility function to generate a Id for objects
 * @return {string}
 */
export default () => {
    try {
        var seed = new Uint8Array(4); //jslint: ignore line
        window.crypto.getRandomValues(seed);
        var id = window.btoa(seed).toString();

        // Remove the = padding from the string
        // https://tools.ietf.org/html/rfc4648#section-3.2 or http://www.faqs.org/rfcs/rfc4648.html
        while(id[id.length-1] === '=') {
            id = id.substr(0, id.length-1);
        }

        return id;
    }
    catch(e) {
        console.error("Could not generate ID");
    }
}