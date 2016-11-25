import { XMLImporter } from 'substance'
import isArray from 'lodash/isArray'
import find from 'lodash/find'

/**
 * NewsMLImporter Importer
 */
class NewsMLImporter extends XMLImporter {

    /**
     *
     * @param newsItemEl
     * @returns {*}
     */
    getFirstElementWithTypeElement(newsItemEl) {
        if(isArray(newsItemEl)) {
            return find(newsItemEl, function(el) {
                try {
                    if( el.nodeType === 'element') {
                        return true;
                    }
                } catch (e) {
                }

            });
        } else {
            return newsItemEl;
        }
    }

    convertDocument(newsItemEl) {
        var newsItemElement = this.getFirstElementWithTypeElement(newsItemEl);
        var groups = newsItemElement.findAll('idf > group[type="body"]');
        var headerGroup = newsItemElement.find('idf > group[type="header"]');

        // Convert headergroup
        if(headerGroup) {
            console.log("Convert header group");
            this.convertElement(headerGroup);
        }

        // Convert body groups
        groups.forEach(function(groupEl) {
            var teaserEl = newsItemElement.findAll('contentMeta > metadata > object[type="x-im/teaser"]');
            if (teaserEl && teaserEl.length === 1) {
                groupEl.append(teaserEl[0]);
            }
            this.convertElement(groupEl);
        }.bind(this));
    }
}

export default NewsMLImporter