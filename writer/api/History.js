var moment = require('moment')

var NilUUID = require('writer/utils/NilUUID');

const HST_KEY = "__history__"
const HST_MAX_LENGTH = 15

/**
 * @class Api.History
 *
 * History api class handles local changes to a document and allows access
 * to a limited versioning of local changes.
 */
class History {

    /**
     * Constructor
     * @param {object} api An instance of the Api class
     */
    constructor(api) {
        this.api = api
        this.storage = null
    }

    /**
     * Check that local storage is available before any operation is performed
     *
     * @returns {boolean}
     */
    isAvailable() {
        if (this.storage !== null) {
            return (this.storage !== false)
        }

        try {
            var storage = window['localStorage'],
                x = '__storage_test__'

            storage.setItem(x, x)
            storage.removeItem(x)
            this.storage = storage

            return true;
        }
        catch (e) {
            this.storage = false
            return false
        }
    }


    /**
     * Get a history object for uuid
     * @returns {*}
     * @param id
     * @param historyList
     */
    get(id, historyList) {
        if (!this.isAvailable()) {
            return false;
        }

        if (!historyList) {
            historyList = this.getHistory();
        }

        let doc = historyList.find((doc) => {
            return doc.id == id;
        });
        return doc || this.createAndAddEmptyHistory(id, historyList);
    }


    createAndAddEmptyHistory(id, historyList) {

        if (!this.isAvailable()) {
            return false;
        }
        let history = {id: id, versions: [], updated: moment()};

        // If this is temporary, add a property to keep track
        if (this.api.hasTemporaryId()) {
            history['unsavedArticle'] = true;
        }

        historyList.push(history)
        return history;
    }


    /**
     * Deletes history for an ID
     * @param id
     */
    deleteHistory(id) {
        let historyForAllArticles = this.getHistory();

        // Keep the other UUIDs
        let historyToBeSaved = historyForAllArticles.filter(function (history) {
            return history.id !== id
        }.bind(this))

        // Save to local storage
        this.saveHistory(historyToBeSaved)
    }


    /**
     * Get history from local storage for all articles and JSON Parse to Object
     * @returns {Array}
     */
    getHistory() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            let historyJson = this.storage.getItem(HST_KEY)
            return (!historyJson) ? [] : JSON.parse(historyJson);
        }
        catch (e) {
            this.api.ui.showNotification('history', null, this.api.i18n.t("Error loading history"));
        }
    }


    /**
     * Removed half the list of articles based on the updated property
     * @param historyObj
     * @returns {boolean}
     */
    cleanOldVersions(historyObj) {
        if (!this.isAvailable()) {
            return false;
        }

        var versions = historyObj.sort(function (a, b) {
            var dateA = moment(a.updated),
                dateB = moment(b.updated)

            if(dateA.isBefore(dateB)) {
                return -1;
            } else {
                return 1;
            }
        });
        versions.splice(0, versions.length/2);

        try {
            this.saveHistory(versions)
        } catch (e) {
            this.api.ui.showNotification('history', null, this.api.i18n.t("Could not save version to local storage"));
        }
    }


    /**
     * Save history to local storage
     * @param history
     * @returns {boolean}
     */
    saveHistory(history) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            let historyJson = JSON.stringify(history)
            this.storage.setItem(HST_KEY, historyJson)
            this.api.triggerEvent(null, 'history:saved', {});
        }
        catch (e) {
            throw e;
        }
    }


    snapshot(action) {
        if (!this.isAvailable()) {
            return false;
        }

        let historyObj = this.getHistory()

        var _lsTotal = 0, _xLen, _x;

        for (_x in localStorage) {
            _xLen = ((localStorage[_x].length + _x.length) * 2);
            _lsTotal += _xLen;
            console.info(_x.substr(0, 50) + " using " + (_xLen / 1024).toFixed(2) + " KB")
        };


        let id = this.api.getIdForArticle()
        let doc = this.get(id, historyObj)

        // Don't grow the version list too much
        if (doc.versions.length >= HST_MAX_LENGTH) {
            doc.versions.shift()
        }

        // Check if version already exists among versions
        let existingVersion = doc.versions.find((version) => {
            return version.src === this.api.getSource();
        });

        if (!existingVersion) {
            // Add the new version
            doc.updated = moment()
            doc.versions.push({
                time: moment(),
                src: this.api.getSource(),
                action: action || null
            })
        }

        try {
            this.saveHistory(historyObj)
        } catch (e) {
            if (e instanceof window.DOMException) {
                this.cleanAndRetry(historyObj);
            } else {
                this.api.ui.showNotification('history', null, this.api.i18n.t(e.message));
            }
        }

    }

    cleanAndRetry(historyObj) {
        try {
            this.cleanOldVersions(historyObj);
        } catch (e) {
            this.api.ui.showNotification('history', null, this.api.i18n.t("Error saving version to local storage"));
        }
        finally {
            this.api.ui.showNotification('history', null, this.api.i18n.t("Error"));
        }

    }


}

module.exports = History
