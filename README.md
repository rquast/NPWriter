**Newspilot Writer**

Based on Substance BETA 5

## Prerequisites
Requires Node 6.9.1 and NPM

##Get started

#### Download and run Newspilot Writer
**Note: You must also download our plugin bundle, see "Download plugin bundle" section further down**
```
git clone git@github.com:Infomaker/NPWriter.git
```

Install depedencies
```
npm install 
```

Start server at [localhost:5000](http://localhost:5000)
```
npm run dev
```


#### Download Plugin bundle
```
git clone git@github.com:Infomaker/NPWriterPluginBundle.git
```

Install depedencies
```
npm install 
```

Start server at [localhost:5001](http://localhost:5001)
```
npm run dev
```



###Running test
Run Jest test with `npm test`

Generate Test coverage with `npm run test-coverage` 

###Plugins
Plugins is loaded externally, meaning the plugins can reside on a completely different URL.

Download the Devkit to get started [Download](https://github.com/Infomaker/NPWriterDevKit)


### Plugins documentation

**Provide a stylesheet for plugin**

To provide a stylesheet for a plugin specify the URL to stylesheet in the config
```
{
    "id": "se.infomaker.dummy",
    ...
    "style": "http://localhost:5001/style.css",
    ...
}
```
       


####Configure which plugins to load
Configure plugins in `./server/config/writer.json`

Add a section for you plugin and specify URL to plugin. 


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
