import jxon from 'jxon'
import omit from 'lodash/omit'
import startsWith from 'lodash/startsWith'
import replace from 'lodash/replace'

import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'

import NewsMLExporter from '../packages/npwriter/NewsMLExporter'

jxon.config({
    autoDate: false,
    parseValues: false,
    lowerCaseTags: false,
    trueIsEmpty: false,
    valueKey: 'keyValue',
    attrPrefix: '@'
})

/**
 * @class NewsItem
 *
 * News item manipulation methods. All methods available directly in the
 * context.api object.
 */
class NewsItem {

    constructor(api) {
        this.api = api
    }

    /**
     * Validate news item before saving
     * This api method is called automatically by the writer when a save is
     * requested. Should normally not be called directly from a plugin as it
     * triggers a full validation from all registered validation plugins.
     *
     * @param {Document} newsItem
     * @param {Function} cbFunc
     */
    isValid(newsItem, cbFunc) {
        var validationResponses = [],
            inNewsItem = newsItem;

        if (!this.isSupportedBrowser()) {
            validationResponses.push({
                plugin: null,
                type: 'error',
                message: 'Saving not allowed. Browser not supported.'
            });
        }
        else {
            this.pluginManager.forEach(function (plugin) {
                var messages = null;
                if (plugin.schema.validation) {
                    try {

                        plugin.schema.validation.context = {
                            api: this,
                            i18n: this.refs.writer.i18n
                        };

                        messages = plugin.schema.validation.isValid(
                            inNewsItem
                        );

                        for (var n = 0; n < messages.length; n++) {
                            messages[n].plugin = plugin;
                            validationResponses.push(messages[n]);
                        }
                    }
                    catch (ex) {
                        validationResponses.push({
                            plugin: plugin,
                            type: 'error',
                            message: 'Exception while validating: ' + ex.message
                        });
                    }
                }
            }.bind(this));
        }

        if (validationResponses.length) {
            this.showMessageDialog(
                validationResponses,
                function () {
                    cbFunc(true, validationResponses); // Continue
                }.bind(this),
                function () {
                    cbFunc(false, validationResponses); // Cancel
                }.bind(this)
            );
        }
        else {
            cbFunc(true, []);
        }
    }

    /**
     * Save news item. Triggers a validation of the news item.
     *
     * @param {Function} onBeforeSave Optional callback function called before saving
     * @param {Function} onError Optional callback function called on validation error
     */
    save(onBeforeSave, onError) {
        if (this.api.browser.isSupported()) {
            this.api.editorSession.saveHandler.saveDocument()
        }
        else {
            // TODO: Display nicer error dialog
            console.log('Unsupported browser. Document not saved!')
        }
        // // Create callback that takes a boolean, true = save, false = cancel
        // this.refs.writer.send('validate', function (isValid) {
        //     if (isValid) {
        //         if (onBeforeSave) {
        //             onBeforeSave();
        //         }
        //         this.refs.writer.send('save');
        //     }
        //     else if (onError) {
        //         onError();
        //     }
        // }.bind(this));
    }

    getSource() {
        var exporter = new NewsMLExporter(this.refs.writer.props.config);
        return exporter.convert(this.refs.writer.props.doc, {}, this.api.newsItemArticle);
    }

    /**
     * Set the NewsML source. Will effectively replace the current article with
     * anything in the incoming NewsML and set the document in an unsaved state.
     *
     * @param {string} newsML The NewsML source
     * @param {object} writerConfig Optional, explicit writer config used internally only, should be empty.
     *
     * @return {object | null}
     */
    setSource(newsML, writerConfig) {
        // var newsMLImporter = new NewsMLImporter(
        //     writerConfig || this.refs.writer.props.config
        // );
        var newsMLImporter = this.api.configurator.createImporter('newsml', {
            api: this.api
        })

        var parser = new DOMParser();
        var newsItemArticle = parser.parseFromString(newsML, "application/xml"),
            idfDocument = newsMLImporter.importDocument(newsML);

        if (writerConfig) {
            return {
                newsItemArticle: newsItemArticle,
                idfDocument: idfDocument
            };
        }

        this.api.newsItemArticle = newsItemArticle;
        this.api.doc = idfDocument;

        this.api.writer.send('replacedoc', {
            newsItemArticle: newsItemArticle,
            idfDocument: idfDocument
        });
    }


    /**
     * Return the GUID in the NewsItemArticle
     * Can return null if no GUID is found in NewsItem
     *
     * @returns {guid|null}
     */
    getGuid() {
        for (var n in this.api.newsItemArticle.childNodes) {
            if (this.api.newsItemArticle.childNodes[n].nodeName === 'newsItem') {
                const guid = this.api.newsItemArticle.childNodes[n].getAttribute('guid')
                if (guid) {
                    return guid
                }
                return null
            }
        }
    }

    /**
     * Set news item guid (uuid)
     *
     * @param {String} New uuid or null to clear
     */
    setGuid(uuid) {
        const newsItemArticle = this.api.newsItemArticle

        for (var n in newsItemArticle.childNodes) {
            if (newsItemArticle.childNodes[n].nodeName === 'newsItem') {
                newsItemArticle.childNodes[n].setAttribute(
                    'guid',
                    (uuid ? uuid : '')
                );
                break;
            }
        }
    }


    /*
     <?xml version="1.0" encoding="UTF-8"?><newsItem xmlns="http://iptc.org/std/nar/2006-10-01/" conformance="power" guid="2e6cd937-f366-4b5c-8b4a-fd2cc38245b1" standard="NewsML-G2" standardversion="2.20" version="1">
     <catalogRef href="http://www.iptc.org/std/catalog/catalog.IPTC-G2-Standards_27.xml"/>
     <catalogRef href="http://infomaker.se/spec/catalog/catalog.infomaker.g2.1_0.xml"/>
     <itemMeta>
     <itemClass qcode="ninat:text"/>
     <provider literal="testdata-1.0"/>
     <versionCreated>2016-03-03T16:09:55+01:00</versionCreated>
     <firstCreated>2016-03-03T16:09:55+01:00</firstCreated>
     <pubStatus qcode="stat:usable"/>
     <service qcode="imchn:sydsvenskan"/>
     <service qcode="imchn:hd"/>
     <title>Ola testar torsdag</title>
     <itemMetaExtProperty type="imext:uri" value="im://article/2e6cd937-f366-4b5c-8b4a-fd2cc38245b1"/>
     */

    removeDocumentURI() {
        var node = this.api.newsItemArticle.querySelector('itemMeta > itemMetaExtProperty[type="imext:uri"]');
        if (node) {
            node.parentNode.removeChild(node);
        }
    }

    /**
     * Get news priority.
     *
     * @return {Object} News priority object
     */
    getNewsPriority() {
        var node = this.api.newsItemArticle.querySelector(
            'contentMeta metadata object[type="x-im/newsvalue"]');
        if (!node) {
            console.warn('News Priority not found in document');
            return null;
        }

        return jxon.build(node);
    }


    /**
     * Create and insert a new newsPriority object into the news item content meta data.
     * Triggers a documentChanged event to all documentChanged listeners except
     * the plugin making the change.
     *
     * @param {string} name Plugin name
     * @param {object} newsPriority
     *
     * @fires event.DOCUMENT_CHANGED
     */
    createNewsPriority(name, newsPriority) {

        var metaDataNode = this.api.newsItemArticle.querySelector('contentMeta metadata'),
            newsValueNode = jxon.unbuild(newsPriority, null, 'object');

        if (!metaDataNode) {
            var contentMetaNode = this.api.newsItemArticle.querySelector('contentMeta');
            metaDataNode = this.api.newsItemArticle.createElement('metadata');
            contentMetaNode.appendChild(metaDataNode);
        }

        metaDataNode.appendChild(newsValueNode.childNodes[0]);

        this.api.events.documentChanged(
            name,
            {
                type: 'newsPriority',
                action: 'add',
                data: this.getNewsPriority(name)
            }
        );
    }


    /**
     * Set news priority.
     *
     * @fixme jxon.unbuild() creates object elements from empty strings which is WRONG
     *
     * @todo Validate in data format object.data.links etc
     * @todo Break out metaDataNode check so more functions can use it
     *
     * @param {string} name Name of the plugin making the call
     * @param {Object} newsPriority News priority object
     *
     * @fires event.DOCUMENT_CHANGED
     */
    setNewsPriority(name, newsPriority) {
        if ('undefined' === typeof newsPriority) {
            throw new Error('Undefined value');
        }

        var metaDataNode = this.api.newsItemArticle.querySelector('contentMeta metadata'),
            newsValueNode = this.api.newsItemArticle.querySelector(
                'contentMeta metadata object[type="x-im/newsvalue"]');

        if (!metaDataNode) {
            var contentMetaNode = this.api.newsItemArticle.querySelector('contentMeta');
            metaDataNode = this.api.newsItemArticle.createElement('metadata');
            contentMetaNode.appendChild(metaDataNode);
        }
        else if (newsValueNode) {
            metaDataNode.removeChild(newsValueNode);
        }

        newsValueNode = jxon.unbuild(newsPriority, null, 'object');
        metaDataNode.appendChild(newsValueNode.childNodes[0]);

        this.api.events.documentChanged(
            name,
            {
                type: 'newsPriority',
                action: 'update',
                data: this.getNewsPriority(name)
            }
        );
    }

    /**
     * Get main channel (channel with attribute why="imext:main")
     *
     * @returns {object}
     */
    getMainChannel() {
        var obj = null,
            node = this.api.newsItemArticle.querySelector('itemMeta service[why="imext:main"]');

        if (node) {
            obj = jxon.build(node);
            obj['qcode'] = obj['@qcode'];
            delete obj['@qcode'];
        }

        return obj;
    }

    /**
     * Get Channels
     * Finds all the service nodes with a qCode containing imchn:
     *
     * Renames @qcode to qcode so plugins doesn't have to handle
     *
     * @returns {Array}
     */
    getChannels() {

        var nodes = this.api.newsItemArticle.querySelectorAll('itemMeta service[qcode]');
        if (!nodes) {
            console.warn('No services with qcode found');
            return [{}];
        }

        var wrapper = [];
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i],
                qCode = node.getAttribute('qcode');

            if (qCode.indexOf('imchn') >= 0) {
                var json = jxon.build(node);

                json['qcode'] = json['@qcode'];
                delete json['@qcode'];

                wrapper.push(json);
            }
        }

        return wrapper;
    }


    /**
     * Add a channel as a <service>.
     * Renaming qcode to @qcode.
     *
     * @param {string} name Name of plugin
     * @param {string} channel Name of channel
     * @param {boolean} setAsMainChannel Set this channel as main channel
     *
     * @fires event.DOCUMENT_CHANGED
     * @throws Error
     */
    addChannel(name, channel, setAsMainChannel) {
        if (!isObject(channel)) {
            throw new Error('addChannel only supports adding one channel at a time');
        }

        var currentChannels = this.getChannels(),
            itemMetaNode = this.api.newsItemArticle.querySelector('itemMeta'),
            service = {};

        if (currentChannels.some(currentChannel => channel.qcode === currentChannel['qcode'])) {
            this.removeChannel(name, channel);
        }

        service['@qcode'] = channel.qcode;

        var mainNodes = this.api.newsItemArticle.querySelectorAll('itemMeta > service[why="imext:main"]');
        if (setAsMainChannel) {
            service['@why'] = 'imext:main';

            for (var n = 0; n < mainNodes.length; n++) {
                mainNodes[n].removeAttribute('why');
            }
        }

        var serviceNode = jxon.unbuild(service, null, 'service');
        itemMetaNode.appendChild(serviceNode.childNodes[0]);

        this.api.events.documentChanged(
            name,
            {
                type: 'channel',
                action: 'add',
                data: channel
            }
        );
    }


    /**
     * Removes <service>.
     *
     * @param {string} name Name of plugin
     * @param {string} channel Name of channel
     * @param {boolean} muteEvent Optional. Mute event if set to true, only used internally.
     *
     * @fires event.DOCUMENT_CHANGED
     * @throws Error
     */
    removeChannel(name, channel, muteEvent) {
        var query = 'itemMeta service[qcode="' + channel['qcode'] + '"]';
        var service = this.api.newsItemArticle.querySelector(query);

        if (!service) {
            // Silently ignore request
            return;
        }

        service.parentElement.removeChild(service);

        if (muteEvent === true) {
            return;
        }

        this.api.events.documentChanged(
            name,
            {
                type: 'channel',
                action: 'delete',
                data: channel
            }
        );
    }


    /**
     * Get the pubStatus of document
     *
     * @returns {Object} Return object with current pubStatus of document
     */
    getPubStatus() {
        let newsItem = this.api.newsItemArticle,
            node = newsItem.querySelector('itemMeta pubStatus')

        if (!node) {
            return null
        }

        var pubStatusNode = jxon.build(node)
        pubStatusNode.qcode = pubStatusNode['@qcode']
        delete pubStatusNode['@qcode']

        return pubStatusNode
    }


    /**
     * Set pubStatus
     * Creates a pubStatus node in itemMeta if it not exists
     *
     * @param {string} name
     * @param {object} pubStatus
     *
     * @fires event.DOCUMENT_CHANGED
     */
    setPubStatus(name, pubStatus) {
        let newsItem = this.api.newsItemArticle,
            node = newsItem.querySelector('itemMeta pubStatus')

        if (!node) {
            let itemMetaNode = newsItem.querySelector('itemMeta')
            node = newsItem.createElement('pubStatus')
            itemMetaNode.appendChild(node)
        }

        node.setAttribute('qcode', pubStatus.qcode)
        this.api.events.documentChanged(name, {
            type: 'pubStatus',
            action: 'set',
            data: pubStatus
        })
    }


    /**
     * Get pubStart
     *
     * @returns {object} Object {value: "2016-02-08T20:37:25 01:00", type: "imext:pubstart"}
     */
    getPubStart() {
        let pubStartNode = this._getItemMetaExtPropertyByType('imext:pubstart')
        if (!pubStartNode) {
            return null
        }

        let pubStartJson = jxon.build(pubStartNode)
        pubStartJson.value = pubStartJson['@value']
        pubStartJson.type = pubStartJson['@type']
        pubStartJson = omit(pubStartJson, ['@type', '@value'])

        return pubStartJson
    }


    /**
     * Set pubStart
     *
     * @param {string} name Plugin name
     * @param {object} pubStart Expect object with value property. Type is ignored. Object {value: "2016-02-08T20:37:25 01:00"}
     *
     * @fires event.DOCUMENT_CHANGED
     */
    setPubStart(name, pubStart) {
        let newsItem = this.api.newsItemArticle,
            pubStartNode = this._getItemMetaExtPropertyByType('imext:pubstart')

        if (!pubStartNode) {
            let itemMetaNode = newsItem.querySelector('itemMeta')
            pubStartNode = newsItem.createElement('itemMetaExtProperty')
            itemMetaNode.appendChild(pubStartNode)
        }

        pubStartNode.setAttribute('value', pubStart.value)
        pubStartNode.setAttribute('type', 'imext:pubstart')

        this.api.events.documentChanged(name, {
            type: 'pubStart',
            action: 'set',
            data: pubStart
        })
    }


    /**
     * Remove the node for the pubStart
     *
     * @param name
     *
     * @fires event.DOCUMENT_CHANGED
     */
    removePubStart(name) {
        let pubStartNode = this._getItemMetaExtPropertyByType('imext:pubstart')

        if (pubStartNode) {
            pubStartNode.parentElement.removeChild(pubStartNode)
        }

        this.api.events.documentChanged(name, {
            type: 'pubStart',
            action: 'delete',
            data: {}
        });
    }


    /**
     * Get pubStop
     *
     * @returns {object}
     */
    getPubStop() {
        let pubStopNode = this._getItemMetaExtPropertyByType('imext:pubstop')

        if (!pubStopNode) {
            return null
        }

        let pubStartJson = jxon.build(pubStopNode)
        pubStartJson.type = pubStartJson['@type']
        pubStartJson.value = pubStartJson['@value']
        delete pubStartJson['@type']
        delete pubStartJson['@value']

        return pubStartJson
    }


    /**
     * Set pubStop.
     *
     * @param {string} name Plugin name
     * @param {object} pubStop
     *
     * @fires event.DOCUMENT_CHANGED
     */
    setPubStop(name, pubStop) {
        let newsItem = this.api.newsItemArticle,
            pubStopNode = this._getItemMetaExtPropertyByType('imext:pubstop')

        if (!pubStopNode) {
            let itemMetaNode = newsItem.querySelector('itemMeta')
            pubStopNode = newsItem.createElement('itemMetaExtProperty')
            itemMetaNode.appendChild(pubStopNode)
        }

        pubStopNode.setAttribute('value', pubStop.value)
        pubStopNode.setAttribute('type', 'imext:pubstop')

        this.api.events.documentChanged(name, {
            type: 'pubStop',
            action: 'set',
            data: pubStop
        })
    }


    /**
     * Remove the node for pubStop.
     *
     * @param {string} name Plugin name
     */
    removePubStop(name) {
        let pubStopNode = this._getItemMetaExtPropertyByType('imext:pubstop')
        if (pubStopNode) {
            pubStopNode.parentElement.removeChild(pubStopNode)
        }

        this.api.events.documentChanged(name, {
            type: 'pubStop',
            action: 'delete',
            data: {}
        });
    }


    /**
     * Get all author links in itemMeta links
     *
     * @returns {*}
     */
    getAuthors(/*name*/) {

        /*jshint validthis:true */
        function normalizeObject(object) {
            Object.keys(object).forEach(function (key) {
                if (startsWith(key, '@')) {
                    var newKey = replace(key, '@', '');
                    object[newKey] = object[key];
                    delete object[key];
                }
            }.bind(this));
            return object;
        }

        var authorNodes = this._getLinksByType('x-im/author');
        if (!authorNodes) {
            return null;
        }

        var authors = [];
        var length = authorNodes.length;
        for (var i = 0; i < length; i++) {
            var author = jxon.build(authorNodes[i]);

            var normalizedAuthor = normalizeObject(author);

            authors.push(normalizedAuthor);
        }

        return authors;
    }


    /**
     * Remove an author from newsItem.
     *
     * @param {string} name Name of the plugin
     * @param {string} uuid The UUID of the author to be deleted
     *
     * @fires event.DOCUMENT_CHANGED
     * @throws {NotFoundException}  When no node is found by provided UUID the NotFoundException is thrown
     */
    removeAuthorByUUID(name, uuid) {
        var authorNode = this.api.newsItemArticle.querySelector(
            'itemMeta links link[type="x-im/author"][uuid="' + uuid + '"]');

        if (authorNode) {
            authorNode.parentElement.removeChild(authorNode);
            this.api.events.documentChanged(name, {
                type: 'author',
                action: 'delete',
                data: authorNode
            });
        }
        else {
            throw new this.NotFoundException('Could not find authorNode with UUID: ' + uuid);
        }
    }


    /**
     * Add an known author with a specified uuid to the newsItem
     *
     * @param {string} name Plugin name
     * @param {object} author Author object with the properties name and uuid
     *
     * @fires event.DOCUMENT_CHANGED
     */
    addAuthor(name, author) {
        var newsItem = this.api.newsItemArticle;
        var linksNode = newsItem.querySelector('itemMeta links');
        var authorLinkNode = newsItem.createElement('link');

        authorLinkNode.setAttribute('title', author.name);
        authorLinkNode.setAttribute('uuid', author.uuid);
        authorLinkNode.setAttribute('rel', 'author');
        authorLinkNode.setAttribute('type', 'x-im/author');
        linksNode.appendChild(authorLinkNode);

        this.api.events.documentChanged(name, {
            type: 'author',
            action: 'add',
            data: author
        });
    }

    /**
     * Add an simple/unknown author to the newsItem
     *
     * @param {string} name Plugin name
     * @param {object} author Author object with the properties name and uuid
     *
     * @fires event.DOCUMENT_CHANGED
     */
    addSimpleAuthor(name, authorName) {
        var newsItem = this.api.newsItemArticle;
        var linksNode = newsItem.querySelector('itemMeta links');
        var authorLinkNode = newsItem.createElement('link');

        authorLinkNode.setAttribute('title', authorName);
        authorLinkNode.setAttribute('uuid', '00000000-0000-0000-0000-000000000000');
        authorLinkNode.setAttribute('rel', 'author');
        authorLinkNode.setAttribute('type', 'x-im/author');
        linksNode.appendChild(authorLinkNode);

        this.api.events.documentChanged(name, {
            type: 'author',
            action: 'add',
            data: authorName
        });
    }

    /**
     * Remove an author from newsItem
     *
     * @param {string} name Name of the plugin
     * @param {string} authorName The name of the author to be deleted
     * @throws {NotFoundException}  When no node is found by provided authorName the NotFoundException is thrown
     *
     */
    removeAuthorByTitle(name, authorName) {
        var authorNode = this.api.newsItemArticle.querySelector(
            'itemMeta links link[type="x-im/author"][title="' + authorName + '"]');

        if (authorNode) {
            authorNode.parentElement.removeChild(authorNode);
            this.api.events.documentChanged(name, {
                type: 'author',
                action: 'delete',
                data: authorName
            });
        }
        else {
            throw new this.NotFoundException('Could not find authorNode with title: ' + authorName);
        }
    }


    /**
     * Helper function to remove all @ on properties
     * @private
     *
     * @param {object} object
     *
     * @returns {*}
     */
    normalizeObject(object) {
        Object.keys(object).forEach(function (key) {
            if (startsWith(key, '@')) {
                var newKey = replace(key, '@', '');
                object[newKey] = object[key];
                delete object[key];
            }
        }.bind(this));
        return object;
    }


    /**
     *
     * Generic method to selector links with a certain type
     *
     * @example
     *
     * this.context.api.getLinksByType(this.name, [ 'x-im/organisation', 'x-im/person', 'x-im/topic' ], "subject")
     *
     * @param name Plugin name
     * @param {array} types Types of links to select
     * @param {string} subject optional Which kind of subject to select, defaults to "subject"
     * @returns {*}
     */
    getLinksByType(name, types, subject) {

        if (!isArray(types)) {
            throw new Error("Argument types is not of type: array");
        }
        if (!subject) {
            subject = "subject";
        }

        var querySelectors = [];
        types.forEach(function (type) {
            querySelectors.push('itemMeta links link[type="' + type + '"][rel="' + subject + '"]');
        }.bind(this));

        var querySelectorString = querySelectors.join(', ');
        var tagLinkNodes = this.api.newsItemArticle.querySelectorAll(querySelectorString);
        if (!tagLinkNodes) {
            return null;
        }

        var tags = [];
        var length = tagLinkNodes.length;
        for (var i = 0; i < length; i++) {
            var tag = jxon.build(tagLinkNodes[i]);
            var normalizedTag = this.normalizeObject(tag);
            tags.push(normalizedTag);
        }
        return tags;
    }


    /**
     * Get tags from document
     * Includes following concept types: x-im/person, x-im/organisation, x-cmbr/channel, x-im/category, x-im/category
     *
     * @example:
     * {
     *  rel: "subject",
     *  title: "Dalarna",
     *  type: "x-im/category",
     *  uuid: "03d22994-91e4-11e5-8994-feff819cdc9f"
     * }
     *
     * @returns {*} Return array of tags in JSON or null if no links was found
     */
    getTags() {
        var tagLinkNodes = this.api.newsItemArticle.querySelectorAll(
            'itemMeta links link[type="x-im/person"][rel="subject"], ' +
            'itemMeta links link[type="x-im/organisation"][rel="subject"], ' +
            'itemMeta links link[type="x-cmbr/channel"][rel="subject"], ' +
            'itemMeta links link[type="x-im/channel"][rel="subject"], ' +
            'itemMeta links link[type="x-im/category"][rel="subject"], ' +
            'itemMeta links link[type="x-im/category"][rel="subject"]');

        if (!tagLinkNodes) {
            return null;
        }

        var tags = [];
        var length = tagLinkNodes.length;
        for (var i = 0; i < length; i++) {
            var tag = jxon.build(tagLinkNodes[i]);
            var normalizedTag = this.normalizeObject(tag);
            tags.push(normalizedTag);
        }
        return tags;
    }


    /**
     * Adds a tag to itemMeta > links section in newsItem
     *
     * The format used is identical to the search response provided by concepts backend
     * @Example
     * { "uuid": "88d36cbe-d6dd-11e5-ab30-625662870761", "name": [ "2016 Eurovision Song Contest" ], "type": [ "story" ], "typeCatalog": [ "imnat" ], "imType": [ "x-im/story" ], "inputValue": "s" }
     *
     * @param {string} name The name of the plugin
     * @param {object} tag Must containt title, type and uuid
     *
     * @fires event.DOCUMENT_CHANGED
     */
    addTag(name, tag) {
        var newsItem = this.api.newsItemArticle;
        var linksNode = newsItem.querySelector('itemMeta links');
        var tagLinkNode = newsItem.createElement('link');

        tagLinkNode.setAttribute('title', tag.name[0]);
        tagLinkNode.setAttribute('uuid', tag.uuid);
        tagLinkNode.setAttribute('rel', 'subject');
        tagLinkNode.setAttribute('type', tag.imType[0]);
        linksNode.appendChild(tagLinkNode);

        this.api.events.documentChanged(name, {
            type: 'tag',
            action: 'add',
            data: tag
        });
    }


    /**
     * Update a tag in itemMeta > links section
     *
     * @param {string} name The name of the plugin
     * @param {string} uuid The UUID of the link element
     * @param {object} tag The tag, same format as concept backend provides in search {"name": [ "2016 Eurovision Song Contest" ], "type": [ "story" ], "typeCatalog": [ "imnat" ], "imType": [ "x-im/story" ] }
     *
     * @fires event.DOCUMENT_CHANGED
     * @throws {NotFoundException}  When no node is found by provided UUID the NotFoundException is thrown
     */
    updateTag(name, uuid, tag) {
        var subject = tag.subject ? tag.subject : "subject";
        var newsItem = this.api.newsItemArticle;
        var linkTagNode = newsItem.querySelector('itemMeta links link[uuid="' + uuid + '"]');

        if (!linkTagNode) {
            throw new this.NotFoundException('Could not find linkNode with UUID: ' + uuid);
        }

        linkTagNode.setAttribute('title', tag.name[0]);
        linkTagNode.setAttribute('rel', subject);
        linkTagNode.setAttribute('type', tag.imType[0]);

        this.api.events.documentChanged(name, {
            type: 'tag',
            action: 'update',
            data: tag
        });
    }


    /**
     * Removes a link in itemMeta links by providing an UUID
     *
     * @param name The name of the plugin calling the method
     * @param uuid The uuid of the link to be removed
     *
     * @fires event.DOCUMENT_CHANGED
     */
    removeLinkByUUID(name, uuid) {
        var linkNode = this.api.newsItemArticle.querySelector('itemMeta links link[uuid="' + uuid + '"]')

        if (linkNode) {
            linkNode.parentElement.removeChild(linkNode)
            this.api.events.documentChanged(name, {
                type: 'tag',
                action: 'delete',
                data: uuid
            })
        }
        else {
            throw new this.NotFoundException('Could not find linkNode with UUID: ' + uuid)
        }
    }


    /**
     * Remove a link from itemMeta links section by type and rel attributes
     *
     * @param {string} name
     * @param {string} uuid
     * @param {string} rel
     *
     * @fires event.DOCUMENT_CHANGED
     */
    removeLinkByUUIDAndRel(name, uuid, rel) {
        var linkNode = this.api.newsItemArticle.querySelector(
            'itemMeta links link[uuid="' + uuid + '"][rel="' + rel + '"]')

        if (linkNode) {
            linkNode.parentElement.removeChild(linkNode)
            this.api.events.documentChanged(name, {
                type: 'link',
                action: 'delete',
                data: rel
            })
        }
        else {
            throw new this.NotFoundException('Could not find linkNode with UUID: ' + uuid)
        }
    }

    /**
     * Adds a new x-im/place link into itemMeta links
     *
     * @example
     * {
     *  "data":
     *    {
     *      "position":"POINT(16.570516 56.774485)"
     *    },
     *  "rel":"subject",
     *  "title":"Rälla",
     *  "type":"x-im/place",
     *  "uuid":"6599923a-d626-11e5-ab30-625662870761"
     * }
     *
     * @param name Plugin name calling function
     * @param location The location in JSON containing
     *
     * @fires event.DOCUMENT_CHANGED
     */
    addLocation(name, location) {
        var newsItem = this.api.newsItemArticle;
        var linksNode = newsItem.querySelector('itemMeta links');
        var locationLinkNode = newsItem.createElement('link');

        locationLinkNode.setAttribute('title', location.title);
        locationLinkNode.setAttribute('uuid', location.uuid);
        locationLinkNode.setAttribute('rel', 'subject');
        locationLinkNode.setAttribute('type', location.type);

        // Position is optional so check if position is provided by users
        if (location.data && location.data.position) {
            var dataNode = newsItem.createElement('data'),
                positionNode = newsItem.createElement('geometry');

            positionNode.textContent = location.data.position;
            dataNode.appendChild(positionNode);

            locationLinkNode.appendChild(dataNode);
        }

        linksNode.appendChild(locationLinkNode);

        this.api.events.documentChanged(name, {
            type: 'location',
            action: 'add',
            data: location
        });
    }

    /**
     * Update a location
     *
     * @param {string} name Name of plugin
     * @param {object} location The location in JSON
     *
     * @fires event.DOCUMENT_CHANGED
     * @throws Error
     */
    updateLocation(name, location) {
        var uuid = location.uuid;
        var linkNode = this.api.newsItemArticle.querySelector('itemMeta links link[uuid="' + uuid + '"]');

        if (linkNode) {
            linkNode.setAttribute('title', location.title);

            var positionNode = linkNode.querySelector('geometry');
            if (!positionNode) {
                var dataNode = this.api.newsItemArticle.createElement('data');
                positionNode = this.api.newsItemArticle.createElement('geometry');
                dataNode.appendChild(positionNode);
                linkNode.appendChild(dataNode);
            }
            positionNode.textContent = location.data.position;

            this.api.events.documentChanged(name, {
                type: 'location',
                action: 'update',
                data: location
            });
        }
        else {
            throw new this.NotFoundException('Could not find linkNode with UUID: ' + uuid);
        }
    }

    /**
     * Get all location with link type x-im/place, x-im/polygon or x-im/position with the specified entity
     *
     * @param {string} entity Optional entity specification, either "all", "position" or "polygon"
     *
     * @returns {array} {"data":{"position":"POINT(16.570516 56.774485)"},"rel":"subject","title":"Rälla","type":"x-im/place","uuid":"6599923a-d626-11e5-ab30-625662870761"}
     */
    getLocations(entity) {
        // Need to fetch all supported location types since there are two use cases, (1) all
        // locations are stored with type 'x-im/place' and (2) locations are stored with their
        // specific type, i.e. 'x-im/polygon' or 'x-im/position'.
        var locationNodes = this._getLinksByType(['x-im/place', 'x-im/polygon', 'x-im/position']);
        if (!locationNodes) {
            return null;
        }

        if (entity !== 'position' && entity !== 'polygon') {
            entity = 'all';
        }

        var locations = [];
        var length = locationNodes.length;
        for (var i = 0; i < length; i++) {
            var tag = jxon.build(locationNodes[i]);
            var normalizedTag = this.normalizeObject(tag);

            if (entity === 'all' || typeof normalizedTag.data === 'undefined' || typeof normalizedTag.data.geometry === 'undefined') {
                locations.push(normalizedTag);
            }
            else if (entity === 'polygon' && (normalizedTag.type === 'x-im/polygon' || normalizedTag.data.geometry.match(/^POLYGON/))) {
                locations.push(normalizedTag);
            }
            else if (entity === 'position' && (normalizedTag.type === 'x-im/position' || normalizedTag.data.geometry.match(/^POINT/))) {
                locations.push(normalizedTag);
            }
        }

        return locations;
    }


    /**
     * Adds a link to itemMeta links section
     *
     * @Example
     * this.context.api.addLink('Pluginname, {
     *       '@rel': 'channel',
     *       '@title': Jeremy Spencer,
     *       '@type': 'x-im/author',
     *       '@uuid': '5f9b8064-d54f-11e5-ab30-625662870761
     *   });
     * <link rel="author" title="Jeremy Spencer" type="x-im/author" uuid="5f9b8064-d54f-11e5-ab30-625662870761"/>
     *
     * @param {string} name The name of the plugin adding the link
     * @param {object} link Uses jxon.unbuild to transform JSON to XML. Make sure to use @ property names for attributes.
     *
     * @fires event.DOCUMENT_CHANGED Fires a documentChanged event with added link
     */
    addLink(name, link) {
        var itemMetaNode = this.api.newsItemArticle.querySelector('itemMeta links');

        var linkXML = jxon.unbuild(link, null, 'link');
        itemMetaNode.appendChild(linkXML.documentElement);

        this.api.events.documentChanged(name, {
            type: 'link',
            action: 'add',
            data: link
        });
    }


    /**
     * Retrieve all links by specified type and rel
     *
     * @param {string} name
     * @param {string} type
     * @param {string} rel
     *
     * @returns {array} Array of links
     */
    getLinkByTypeAndRel(name, type, rel) {
        var linkNodes = this.api.newsItemArticle.querySelectorAll(
            'itemMeta links link[type="' + type + '"][rel="' + rel + '"]');
        if (!linkNodes) {
            return null;
        }

        var links = [];
        for (var i = 0; i < linkNodes.length; i++) {
            links.push(jxon.build(linkNodes[i]));
        }

        return links;
    }


    /**
     * Get links in itemMeta links section by specified type
     *
     * @param {string} name Name of the plugin
     * @param {string} type The link type
     *
     * @returns {array} Return array of links transformed to JSON
     */
    getLinkByType(name, type) {
        var linkNodes = this.api.newsItemArticle.querySelectorAll('itemMeta links link[type="' + type + '"]');
        if (!linkNodes) {
            return null;
        }

        var links = [];
        for (var i = 0; i < linkNodes.length; i++) {
            links.push(jxon.build(linkNodes[i]));
        }

        return links;
    }


    /**
     * Get stories
     *
     * @return {array} Array of stories found
     */
    getStories() {
        var linkNodes = this._getLinksByType('x-im/story');
        if (!linkNodes) {
            return null;
        }

        var stories = [];
        var length = linkNodes.length;
        for (var i = 0; i < length; i++) {
            var link = jxon.build(linkNodes[i]);
            var normalizedTag = this.normalizeObject(link);
            stories.push(normalizedTag);
        }

        return stories;
    }


    /**
     * Add a story link to itemMeta links section
     *
     * @example
     * {
     *  "uuid": "88d36cbe-d6dd-11e5-ab30-625662870761",
     *  "title": "A name"
     * }
     * @param name
     * @param story
     *
     * @fires event.DOCUMENT_CHANGED
     */
    addStory(name, story) {
        var newsItem = this.api.newsItemArticle;
        var linksNode = newsItem.querySelector('itemMeta links');
        var linkNode = newsItem.createElement('link');

        linkNode.setAttribute('title', story.title);
        linkNode.setAttribute('uuid', story.uuid);
        linkNode.setAttribute('rel', 'subject');
        linkNode.setAttribute('type', 'x-im/story');

        linksNode.appendChild(linkNode);
        this.api.events.documentChanged(name, {
            type: 'story',
            action: 'add',
            data: story
        });
    }


    /**
     * Updates title on existing story
     * @param {string} name Plugin name
     * @param {object} story A story object that atleast contains title and uuid
     *
     * @fires event.DOCUMENT_CHANGED
     *
     * @example
     * {
     *  "uuid": "88d36cbe-d6dd-11e5-ab30-625662870761",
     *  "title": "A name"
     * }
     */
    updateStory(name, story) {
        var uuid = story.uuid;
        var linkNode = this.api.newsItemArticle.querySelector('itemMeta links link[uuid="' + uuid + '"]');

        if (linkNode) {
            linkNode.setAttribute('title', story.title);
            this.api.events.documentChanged(name, {
                type: 'story',
                action: 'update',
                data: story
            });
        }
        else {
            throw new this.NotFoundException('Could not find linkNode with UUID: ' + uuid);
        }
    }


    /**
     * Adds a content-profile link to NewsItem
     *
     * @example
     * {
     *  "uuid": "88d36cbe-d6dd-11e5-ab30-625662870761",
     *  "title": "A name"
     * }
     * @param {string} name Name of the plugin
     * @param {object} contentprofile A contentprofile object containing uuid and title
     *
     * @fires event.DOCUMENT_CHANGED
     */
    addConceptProfile(name, contentprofile) {
        var newsItem = this.api.newsItemArticle;
        var linksNode = newsItem.querySelector('itemMeta links');
        var linkNode = newsItem.createElement('link');

        linkNode.setAttribute('title', contentprofile.title);
        linkNode.setAttribute('uuid', contentprofile.uuid);
        linkNode.setAttribute('rel', 'subject');
        linkNode.setAttribute('type', 'x-im/content-profile');

        linksNode.appendChild(linkNode);

        this.api.events.documentChanged(name, {
            type: 'contentprofile',
            action: 'add',
            data: contentprofile
        });
    }


    /**
     * Adds a category link to NewsItem
     *
     * @example
     * {
     *  "uuid": "88d36cbe-d6dd-11e5-ab30-625662870761",
     *  "title": "A name"
     * }
     * @param {string} name Name of the plugin
     * @param {object} category A category object containing uuid and title
     *
     * @fires event.DOCUMENT_CHANGED
     */
    addCategory(name, category) {
        var newsItem = this.api.newsItemArticle;
        var linksNode = newsItem.querySelector('itemMeta links');
        var linkNode = newsItem.createElement('link');

        linkNode.setAttribute('title', category.title);
        linkNode.setAttribute('uuid', category.uuid);
        linkNode.setAttribute('rel', 'subject');
        linkNode.setAttribute('type', 'x-im/category');

        linksNode.appendChild(linkNode);

        this.api.events.documentChanged(name, {
            type: 'category',
            action: 'add',
            data: category
        });
    }


    /**
     * Updates title on existing story
     *
     * @param {string} name Plugin name
     * @param {object} story A concept profile object that atleast contains title and uuid
     *
     * @fires event.DOCUMENT_CHANGED
     *
     * @example
     * {
     *  "uuid": "88d36cbe-d6dd-11e5-ab30-625662870761",
     *  "title": "A name"
     * }
     */
    updateConceptProfile(name, contentprofile) {
        var uuid = contentprofile.uuid;
        var linkNode = this.api.newsItemArticle.querySelector('itemMeta links link[uuid="' + uuid + '"]');

        if (linkNode) {
            linkNode.setAttribute('title', contentprofile.title);
            this.api.events.documentChanged(name, {
                type: 'contentprofile',
                action: 'update',
                data: contentprofile
            });
        }
        else {
            throw new this.NotFoundException('Could not find linkNode with UUID: ' + uuid);
        }
    }


    /**
     *
     * Returns a list of all existing content-profiles in NewsItem
     *
     * @returns {array | null}
     */
    getContentProfiles() {
        var linkNodes = this._getLinksByType('x-im/content-profile');
        if (!linkNodes) {
            return null;
        }

        var links = [];
        var length = linkNodes.length;
        for (var i = 0; i < length; i++) {
            var link = jxon.build(linkNodes[i]);
            var normalizedTag = this.normalizeObject(link);
            links.push(normalizedTag);
        }

        return links;
    }


    /**
     * Returns a list of all existing categories in NewsItem
     *
     * @returns {array | null}
     */
    getCategories() {
        var linkNodes = this._getLinksByType('x-im/category');
        if (!linkNodes) {
            return null;
        }

        var links = [];
        var length = linkNodes.length;
        for (var i = 0; i < length; i++) {
            var link = jxon.build(linkNodes[i]);
            var normalizedTag = this.normalizeObject(link);
            links.push(normalizedTag);
        }

        return links;
    }


    /**
     * Generic method to find different itemMetaExtproperty nodes
     *
     * @param {string} imExtType Type of itemMetaExtproprtyNode
     * @returns {Element}
     */
    _getItemMetaExtPropertyByType(imExtType) {
        return this.api.newsItemArticle.querySelector(
            'itemMeta itemMetaExtProperty[type="' + imExtType + '"]'
        )
    }


    /**
     * Private method to find signal by qcode
     * @param {string} qcode Ex: sig:update
     * @returns {Element}
     * @private
     */
    _getSignalNodeByQcode(qcode) {
        return this.api.newsItemArticle.querySelector('itemMeta signal[qcode="' + qcode + '"]');
    }


    /**
     * Private method to get links by type
     * @returns {NodeList}
     * @access private
     */
    _getLinksByType(type) {
        if (Array.isArray(type)) {
            var queryArr = [];
            type.forEach(function (linkType) {
                queryArr.push('itemMeta links link[type="' + linkType + '"]')
            });

            var query = queryArr.join();
            return this.api.newsItemArticle.querySelectorAll(query);
        }
        else {
            return this.api.newsItemArticle.querySelectorAll('itemMeta links link[type="' + type + '"]');
        }
    }

}
export default NewsItem
