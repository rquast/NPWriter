var fetch = require('node-fetch')
import NewsItem from '../../../writer/api/NewsItem'

describe('Loads newsItem', () => {

    it('Can use DOMDocument', () => {

        return fetch('http://127.0.0.1:5000/api/newsitem/c349d4f8-0b93-41fe-bb6a-c37184fe40f7?imType=x-im/article').then(response => response.text()).then((xml) => {

            const parser = new DOMParser()
            let newsItem = parser.parseFromString(xml, "application/xml");
            let test = newsItem.querySelector('contentMeta metadata').querySelector('object')

            expect(test.getAttribute('id')).toBe('RYaudnAJj8gQ')

        });

        //
        // // const newsItem = new NewsItem()
        // document.body.innerHTML =
        //     '<div>' +
        //     '  <span id="username" />' +
        //     '  <button id="button" class="test"/>' +
        //     '</div>';
        //
        // console.log("Byttion", document.getElementById("button").getAttribute('class'));

    })

})