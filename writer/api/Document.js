import { createAnnotation, insertText, NodeSelection } from 'substance'
import idGenerator from '../utils/IdGenerator'

/**
 * @class Document
 *
 * Document manipulation methods. All methods available directly in the
 * context.api object.
 */
class Document {

    constructor(api) {
        this.api = api
    }

    /**
     * Insert an inline node at current selection
     * @param {string} name The plugin which inserts inline node
     * @param {object} data Data defined by node schema
     * @returns {*}
     */
    insertInlineNode(name, data) {

        let newAnno
        const surface = this.refs.writer.getFocusedSurface();

        if (!surface) {
            throw new Error("Trying to insert node with no active surface");
        }

        return surface.transaction((tx, args) => {

            // 1. Insert fake character where the citation should stick on
            args = insertText(tx, {
                selection: args.selection,
                text: '$'
            });

            var citationSel = this.doc.createSelection({
                type: 'property',
                path: args.selection.path,
                startOffset: args.selection.endOffset - 1,
                endOffset: args.selection.endOffset
            });


            // 2. Create citation annotation
            args.annotationType = name;
            args.annotationData = data;
            args.selection = citationSel;
            args.splitContainerSelections = false;
            args.containerId = surface.getContainerId();

            args = createAnnotation(tx, args);
            newAnno = args.result;
            return args;
        });
    }


    /**
     * Function to insert block node at current selection
     *
     * @param {string} name Plugin that's inserting block node
     * @param {object} data Data defined by node
     */
    insertBlockNode(name, data) {

        var surface = this.refs.writer.getFocusedSurface(),
            result;

        if (!surface) {
            throw new Error("Trying to insert node with no active surface");
        }

        // Add type and a generated id if not provided
        data.type = !data.type ? name : data.type;
        data.id = !data.id ? idGenerator() : data.id;

        surface.transaction((tx, args) => {
            args.node = data;
            args.containerId = 'body';
            result = surface.insertNode(tx, args);
        });
        return result;

    }

    /**
     * Deletes a node from the document.
     * Triggers a 'data:changed' event to all data:changed listeners except
     * the plugin making the change.
     *
     * @param {string} name Plugin name
     * @param {object} node Node to delete, must contain an id
     * @example this.context.api.deleteNode(this.props.node);
     * @fires data:changed
     */
    deleteNode(name, node) {
        var deleteNode = require('substance/model/transform/deleteNode');
        var docSession = this.refs.writer.getDocumentSession();
        var surface = this.refs.writer.getFocusedSurface();

        var beforeSelection = surface.getSelection();

        docSession.transaction((tx, args) => {
            args.nodeId = node.id;
            deleteNode(tx, args);
        });

        surface.setSelection(beforeSelection);

        this.triggerEvent(name, 'data:changed', {});
    }


    /**
     * Get all nodes in the document
     * Get all nodeId:s from body container and fetch the actual node by Id
     *
     * @returns {Array}
     */
    getDocumentNodes() {
        const doc = this.api.doc

        const docNodes = doc.getNodes()['body'].nodes;
        return docNodes.map((nodeId) => {
            return doc.get(nodeId)
        })
    }


    /**
     * Make element/node combination draggable within the writer. At the
     * moment only a (with href attribute) and img elements are supported.
     *
     * @param {object} element
     * @param {object} node
     */
    handleDrag(el, node) {
        var nodeId = node.id;

        el.attr('draggable', 'true');
        el.attr('href', '#' + node.id);
        el.on('click', function (evt) {
            evt.preventDefault();
        });

        el.on('dragstart', (evt) => {
            this.context.surface._draggedSelection = new NodeSelection(nodeId);

            // Necessary for firefox to work
            evt.dataTransfer.setData('nodeid', nodeId);
            evt.target.style.opacity = 0.4;
            evt.stopPropagation();
        });

        el.on('dragend', function (evt) {
            evt.target.style.opacity = 1;
        });
    }
}

export default Document