import {XMLExporter, DefaultDOMElement} from 'substance'

class NewsMLExporter extends XMLExporter {

    constructor(...args) {
        super(...args)
    }

    removeElementIfExists(textEditElement, existingChildren) {
        existingChildren.forEach((child) => {
            if (textEditElement.el.tagName === child.nodeName && textEditElement.el.getAttribute('type') === child.getAttribute('type')) {
                child.remove()
            }
        })
    }

    addHeaderGroup(doc, newsItem, $$, groupContainer) {

        const idfHeaderGroup = newsItem.querySelector('idf group[type="header"]')
        if(!idfHeaderGroup) {
            return
        }

        const textEditComponents = this.context.api.configurator.getTextEditComponents()

        let headerElements = textEditComponents.map((textEditComponent) => {
            const node = doc.get(textEditComponent.nodeType)
            if(node) {
                const convertedTextEdit = this.convertNode(node)
                return convertedTextEdit.childNodes
            }
        }).filter((headerElement) => {
            if(headerElement) {
                return headerElement
            }
        })

        if (headerElements && headerElements.length > 0) {
            headerElements.forEach((elements) => {
                elements.forEach(element => {
                    this.removeElementIfExists(element, idfHeaderGroup.childNodes)
                    idfHeaderGroup.appendChild(element.el)
                })
            })
        }
    }

    addBodyGroup(doc, newsItem, groupContainer) {
        // Get the first group with type body in IDF section
        var idfBodyGroupNode = newsItem.querySelector('idf group[type="body"]');
        if (!idfBodyGroupNode) {
            throw new Error('IDF node not found!');
        }

        // Export article body with substance convert container function
        // Create a substance group element to make life easier
        var bodyElements = this.convertContainer(doc.get('body'));
        var bodyGroup = document.createElement('group')
        bodyGroup.setAttribute('type', 'body');

        for (var node of bodyElements) {
            bodyGroup.appendChild(node.el);
        }

        // Reinsert the body group
        let parser = new DOMParser()
        var articleDomElement = parser.parseFromString(bodyGroup.outerHTML, 'application/xml');

        groupContainer.removeChild(idfBodyGroupNode);
        // Append body group
        groupContainer.appendChild(articleDomElement.documentElement);


    }

    addTeaser(newsItem, groupContainer) {
        // Extract x-im/teaser object and move it to its correct position if it exists
        var oldTeaser = newsItem.querySelector('contentMeta > metadata > object[type="x-im/teaser"]');
        var metadata = newsItem.querySelector('contentMeta > metadata');
        if (oldTeaser) {
            metadata.removeChild(oldTeaser);
        }

        var newTeaser = groupContainer.querySelector('object[type="x-im/teaser"]');

        if (newTeaser) {
            newTeaser.parentElement.removeChild(newTeaser);
            metadata.appendChild(newTeaser);
        }
    }


    exportDocument(doc, newsItemArticle) {

        recursivelyRemoveInvalidXml(doc);

        this.state.doc = doc
        const $$ = this.$$
        var groupContainer = newsItemArticle.querySelector('idf');

        this.addHeaderGroup(doc, newsItemArticle, $$, groupContainer);
        this.addBodyGroup(doc, newsItemArticle, groupContainer);
        this.addTeaser(newsItemArticle, groupContainer);

        // let articleEl = this.convertNode(doc.get('body'))
        return newsItemArticle.documentElement.outerHTML;
    }

    convert(doc, options, newsItem) {

        console.info("convert method is deprecated, use exportDocument")

        recursivelyRemoveInvalidXml(doc);

        this.state.doc = doc;
        var $$ = this.$$;

        // Remove the body group and save the parent
        var groupContainer = newsItem.querySelector('idf');

        // Add converted header, body group and add teaser
        // this.addHeaderGroup(doc, newsItem, $$, groupContainer);
        // this.addBodyGroup(doc, newsItem, $$, groupContainer);
        // this.addTeaser(newsItem, groupContainer);


        return newsItem.documentElement.outerHTML;
    }
}

export default NewsMLExporter

function recursivelyRemoveInvalidXml(doc) {
    for (var item in doc.data.nodes) {
        if (doc.data.nodes.hasOwnProperty(item)) {
            var node = doc.data.nodes[item];
            if (node.content) {
                node.content = removeControlCodes(node.content);
            }
        }
    }
}

/**
 * Removes for XML illegal control codes from text (range from 0x00 - 0x1F with the exception of
 * TAB, CR and LF). See http://www.w3.org/TR/xml/#charsets
 * @param {string} text to process
 * @return {string} Text without control codes
 */
function removeControlCodes(text) {
    var regex = new RegExp("[\x00-\x08\x0b\x0c\x0e-\x1f]", "g");
    if (text !== undefined) {
        if (regex.exec(text) != null) {
            console.log("Removing illegal XML character in content");
            return text.replace(regex, "");
        }
    }

    return text;
}

/*
 function NewsMLExporter(writerConfig) {
 var DocumentSchema = require('substance/model/DocumentSchema');

 var schema = new DocumentSchema("idf-article", "1.0.0");
 schema.getDefaultTextType = function () {
 return "paragraph";
 };

 NewsMLExporter.super.call(this, {
 schema: schema,
 converters: writerConfig.converters
 });
 }

 NewsMLExporter.Prototype = function () {


 this.addHeaderGroup = function(doc, newsItem, $$, groupContainer) {
 if (doc.get('metadata')) {
 var idfHeaderGroup = newsItem.querySelector('idf group[type="header"]');
 var headerElements = this.convertNode(doc.get('metadata'));
 var headerGroup = $$('group').attr('type', 'body');
 headerGroup.append(headerElements);
 var headerDomElement = $.parseXML(headerGroup.innerHTML).firstChild;
 groupContainer.removeChild(idfHeaderGroup);
 groupContainer.appendChild(headerDomElement);
 }
 };

 this.addBodyGroup = function(doc, newsItem, $$, groupContainer) {
 // Get the first group with type body in IDF section
 var idfBodyGroupNode = newsItem.querySelector('idf group[type="body"]');
 if(!idfBodyGroupNode) {
 throw new Error('IDF node not found!');
 }

 // Export article body with substance convert container function
 // Create a substance group element to make life easier
 var bodyElements = this.convertContainer(doc.get('body'));
 var bodyGroup = $$('group').attr('type', 'body');
 bodyGroup.append(bodyElements);

 // Reinsert the body group
 var articleDomElement = $.parseXML(bodyGroup.outerHTML).firstChild;

 groupContainer.removeChild(idfBodyGroupNode);
 // Append body group
 groupContainer.appendChild(articleDomElement);


 };

 this.addTeaser = function(newsItem, groupContainer) {
 // Extract x-im/teaser object and move it to its correct position if it exists
 var oldTeaser = newsItem.querySelector('contentMeta > metadata > object[type="x-im/teaser"]');
 var metadata = newsItem.querySelector('contentMeta > metadata');

 if (oldTeaser) {
 metadata.removeChild(oldTeaser);
 }

 var newTeaser = groupContainer.querySelector('object[type="x-im/teaser"]');
 if (newTeaser) {
 newTeaser.parentElement.removeChild(newTeaser);
 metadata.appendChild(newTeaser);
 }
 };

 this.convert = function (doc, options, newsItem) {

 this.state.doc = doc;
 var $$ = this.$$;

 // Remove the body group and save the parent
 var groupContainer = newsItem.querySelector('idf');

 // Add converted header, body group and add teaser
 this.addHeaderGroup(doc, newsItem, $$, groupContainer);
 this.addBodyGroup(doc, newsItem, $$, groupContainer);
 this.addTeaser(newsItem, groupContainer);

 return newsItem.documentElement.outerHTML;
 };
 };

 HtmlExporter.extend(NewsMLExporter);

 module.exports = NewsMLExporter;
 */