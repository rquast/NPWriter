import find from 'lodash/find'
import remove from 'lodash/remove'
import Event from '../utils/Event'
/**
 * @class Events
 *
 * Event handling methods. All methods available directly in the context.api object.
 */
class Events {

    constructor() {
        this.eventListeners = []
    }
    /**
     * Writer controller fires keypressed:esc
     * name: keypressed:esc
     */

    /**
     * Register event listener for a specific plugin.
     *
     * @todo Should either warn or allow for several eventlisteners on the same event for the same plugin
     *
     * @param {string} name The plugin which listens for the event.
     * @param {string} eventType The event to listen for.
     * @param {Function} Function to call when event is triggered.
     */
    on(name, eventType, func) {
        if (find(this.eventListeners, function (obj) {
                return obj.name === name && obj.eventType === eventType;
            })) {
            return;
        }

        this.eventListeners.push({
            name: name,
            eventType: eventType,
            func: func
        });
    }


    /**
     * Unregister event listener for a specific plugin.
     *
     * @todo How do we unregister an event listener if there are several listeners for en event type?
     *
     * @param {string} name The plugin which listens for the event.
     * @param {string} eventType The event to stop listening for.
     */
    off(name, eventType) {
        remove(this.eventListeners, function (obj) {
            return obj.name === name && obj.eventType === eventType;
        });
    }

    /**
     * Trigger an event.
     *
     * @private
     *
     * @param {string} name Plugin type to not send event to, leave it empty to send to all
     * @param {string} eventType The event type to trigger
     * @param {*} data Event specific data
     */
    triggerEvent(name, eventType, data) {
        for (var n = 0; n < this.eventListeners.length; n++) {
            if (this.eventListeners[n].eventType === eventType && this.eventListeners[n].name !== name) {
                this.eventListeners[n].func({
                    name: name,
                    eventType: eventType,
                    data: data
                });
            }
        }
    }

    /**
     * Trigger event, renamed to triggerEvent as it is a publicly needed function.
     *
     * @deprecated
     */
    _triggerEvent(name, eventType, data) {
        this.triggerEvent(name, eventType, data);
    }

    /**
     * Triggers an document changed event (document:changed)
     *
     * @param {object} data an object with change, info, and doc
     */
    onDocumentChanged(data) {
        this.triggerEvent(null, Event.DOCUMENT_CHANGED, data);
    }

    /**
     * Event when document becomes unsaved. Only triggers one time when there's unsaved changes
     * (document:isunsaved)
     *
     * @param {object} originalEvent Data that originally triggered the document is unsaved event
     */
    documentIsUnsaved(originalEvent) {
        this.triggerEvent(null, 'document:isunsaved', originalEvent);
    }

    /**
     * Triggers an document saved event (document:saved)
     */
    onDocumentSaved() {
        this.triggerEvent(null, Event.DOCUMENT_SAVED);
    }


    /**
     * Triggers a document start saving event (document:startsaving)
     */
    onDocumentStartSaving() {
        this.triggerEvent(null, 'document:startsaving');
    }


    /**
     * Triggers an event when the save process did not succeed (document:savefailed)
     */
    onDocumentSaveFailed(error) {
        this.triggerEvent(null, 'document:savefailed', error);
    }

}
export default Events
