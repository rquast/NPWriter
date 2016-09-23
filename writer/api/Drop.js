import entityMatcher from './EntityMatcher'

/**
 * @class Drop
 *
 * Drop handling methods. All methods available directly in the context.api object.
 */
class Drop {

    /**
     * Handles dropped files
     * Called internally from the Writer, should not be used directly by plugins.
     *
     * @param {object} evt Drop event
     * @param {Surface} surface Substance surface
     * @param {PluginManager} pluginManager
     * @param {object} plugin
     * @param {object} context
     * @returns {boolean}
     */
    handleFilesDrop(evt, surface, pluginManager, plugin, context) {

        if (typeof window.FileReader === 'undefined') {
            if (typeof window.FileReader === 'undefined') {
                console.error('Drop not available, window.FileReader undefined');
                return false;
            }
        }

        try {
            for (var n = 0; n < evt.dataTransfer.files.length; n++) {
                var file = evt.dataTransfer.files[n];
                var commands = pluginManager.getHandlerCommandsForFile(file.type);
                commands.forEach(function (command) {
                    if (!plugin || plugin === command) {
                        surface.executeCommand(command, {type: 'file', data: file, context: context});
                    }
                });
            }
            return true;
        } catch (e) {
            console.log(e);
        }
        return false;
    }

    /**
     * Handles pasted or dropped uris.
     * Called internally from the Writer, should not be used directly by plugins.
     *
     * @param {array} uris List of uris
     * @param {Surface} surface Substance surface
     * @param {object} plugin
     * @param {object} context
     * @returns {boolean}
     */
    handleUris(uris, surface, plugin, context) {

        var pluginManager = this.pluginManager;

        try {
            if (uris) {
                for (var n = 0; n < uris.length; n++) {
                    var uri = uris[n];

                    var result = entityMatcher.exec(uri);

                    if (result) {
                        this.handleEntityDrop(
                            {type: result[1], uuid: result[2], title: result[3]},
                            surface, plugin, context);
                    } else {
                        var dropCommands = pluginManager.getHandlerCommands('uri', uri);
                        if (dropCommands.length === 0) {
                            console.warn('No plugin found to handle drop for uri <' + uri + '>');
                            return false;
                        }

                        dropCommands.forEach(function (commandName) { /* jshint ignore:line */
                            if (!plugin || commandName === plugin) {
                                if (context) {
                                    surface.executeCommand(commandName,
                                        {type: 'uri', data: uri, context: context});
                                } else {
                                    surface.executeCommand(commandName, uri);
                                }
                            }
                        });
                    }
                }

                return true;
            }
        }
        catch
            (e) {
            console.log(e);
            return false;
        }
    };

    /**
     * Handles dropped entities.
     * Called internally from the Writer, should not be used directly by plugins.
     *
     * @param {object} data Entity object
     * @param {Surface} surface Substance surface
     * @param {object} plugin
     * @param {object} context
     * @returns {boolean}
     */
    handleEntityDrop(data, surface, plugin, context) {
        var pluginManager = this.pluginManager;

        this.router.get('/api/newsitem/' + data.uuid, {imType: data.type})
            .done(function (str) {

                var dom = $.parseXML(str),
                    itemClass = dom.querySelector(
                        'newsItem > itemMeta > itemClass').getAttribute('qcode');

                var newsItemCommands = pluginManager.getHandlerCommands('newsItem', itemClass);

                if (newsItemCommands.length === 0) {
                    console.warn('No plugin found to handle drop of type newsitem', data.type, data.uuid);
                    return false;
                }

                newsItemCommands.forEach(function (commandName) {
                    // Execute for all plugins if plugin is not specified, otherwise plugin name have to match
                    if (!plugin || plugin === commandName) {
                        surface.executeCommand(commandName,
                            {type: 'newsItem', data: dom, context: context});
                    }
                });

            })
            .error(function (error, xhr, text) {
                // TODO: Display error message
                console.error(error, xhr, text);
            });

    };


    extractUrisFromDrop(dataTransfer) {
        var uriList = dataTransfer.types.find(function (item) {
            return item === 'text/uri-list';
        });

        if (uriList) {
            return dataTransfer.getData(uriList).split('\n').filter(function (item) {
                return !item.startsWith('#');
            });
        }

        var textData = dataTransfer.getData('text/plain');
        var match = /(https?:\/\/[^\s]+)/.exec(textData);
        if (match) {
            return match[1];
        }

        return undefined;
    }

    /**
     * Handles drop.
     *
     * @param {Surface} surface Substance surface
     * @param {object} evt Drop event object
     * @param {object} plugin
     * @param {object} context
     */
    handleDrop(surface, evt, plugin, context) {
        var isStandardDrop = evt.dataTransfer.files.length === 0;

        if (isStandardDrop) {
            var uris = this.extractUrisFromDrop(evt.dataTransfer);

            this.handleUris(uris, surface, plugin, context);
        } else {
            this.handleFilesDrop(evt, surface, this.pluginManager, plugin, context);
        }

    };

}


export default Drop
