**Newspilot Writer**

Based on Substance BETA 5

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

