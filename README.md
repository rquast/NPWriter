**Newspilot Writer**

Based on Substance BETA 5

###Breaking changes for plugin development
New endpoints in the API

**Dialog**
The dialog methods has moved to:

`api.ui.showDialog` (was api.showDialog)

`api.ui.showMessageDialog` (was api.showMessageDialog)


###Get started

* `npm install`
* Start by running: `npm run dev`
* Server should be running at `127.0.0.1:5000` 


###Plugins
Plugins is loaded externally, meaning the plugins can reside on a completely different URL.
Infomaker plugins is currently located in `./plugins/` and is served by the Node Server

####Configure which plugins to load
Configure plugins in `./server/routes/plugins.json`

This file should be moved to another location, for example S3 or a database


###Import API and Components in your plugin
Writer API and Substance components are pre-built. 
To import classes and such you can do the following 

`const { api } = Writer`
