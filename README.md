**Newspilot Writer**

Based on Substance BETA 5


###Get started

* `npm install`
* Start by running: `npm run dev`
* Server should be running at `127.0.0.1:5000` 

###Running test
Run Jest test with `npm test`

Generate Test coverage with `npm run test-coverage` 

###Plugins
Plugins is loaded externally, meaning the plugins can reside on a completely different URL.

Download the Devkit to get started [Download](https://github.com/Infomaker/NPWriterDevKit)


####Configure which plugins to load
Configure plugins in `./server/config/writer.json`

This file should be moved to another location, for example S3 or a database


###Import API and Components in your plugin
Writer API and Substance components are pre-built. 
To import classes and such you can do the following 

`const { api } = Writer`


##Breaking changes for plugin development
We have made some changes to the API. Mostly it's just the method that's changed and not the signatures.

**New endpoints in the API**



####Dialog
The dialog methods has moved to:

`api.ui.showDialog` (was api.showDialog)

`api.ui.showMessageDialog` (was api.showMessageDialog)

####Events
New endpoint calling on/off for Events

`api.events.on()` (was api.on)

`api.events.off()` (was api.off)

`api.events.triggerEvent()` (was api.triggerEvent)


####Document 
`api.document.insertInlineNode` (was api.insertInlineNode)
