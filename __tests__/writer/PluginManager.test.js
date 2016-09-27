import PluginManager from '../../writer/utils/PluginManager'

describe('validate and register plugin packages with pluginmanager', () => {
    let pluginManager, configurator
    beforeEach(() => {
        // Mock configurator class
        configurator = {
            import: (data) => {
            }
        }
        pluginManager = new PluginManager(configurator);
    })

    it('Register Plugin with faulty package results in error', () => {
        var register = () => {
            pluginManager.registerPlugin({})
        }
        expect(register).toThrowError(/Package/);
    })


    it('Failes when registering package without id', () => {
        const pluginPackage = {
            'name': 'dummy',
            'configure': () => {
            }
        }
        expect(pluginManager.validatePluginPackage(pluginPackage)).toBe(false)
    })


    it('Failes when registering package without name', () => {
        const pluginPackage = {
            'id': 'se.infomaker.dummy',
            'configure': () => {
            }
        }
        expect(pluginManager.validatePluginPackage(pluginPackage)).toBe(false)
    })


    it('Failes when registering package without configure method', () => {
        const pluginPackage = {
            'name': 'dummy',
            'id': 'se.infomaker.dummy'
        }
        expect(pluginManager.validatePluginPackage(pluginPackage)).toBe(false)
    })


    it('Failes when registering package configure method as string', () => {
        const pluginPackage = {
            'name': 'dummy',
            'id': 'se.infomaker.dummy',
            'configure': 'not_a_function'
        }
        expect(pluginManager.validatePluginPackage(pluginPackage)).toBe(false)
    })


    it('Registers package with id, name, and configure function', () => {
        const pluginPackage = {
            'name': 'dummy',
            'id': 'se.infomaker.dummy',
            'configure': () => {
            }
        }
        expect(pluginManager.validatePluginPackage(pluginPackage)).toBe(true)
    })


    it('Adds plugin register function to registerPluginList Map', () => {
        const plugins = [
            {
                id: 'se.infomaker.dummy',
                name: 'dummy',
                configure: () => {
                }
            }
        ]

        pluginManager.load(plugins)

        // Expect to have have register function
        expect(pluginManager.registerPluginList.size).toBe(1)

        // Expect to have a key in Map that's the same as plugin id
        expect(pluginManager.registerPluginList.has(plugins[0].id)).toBe(true)

        // Expect to be of type function
        var func = pluginManager.registerPluginList.get(plugins[0].id)
        expect(typeof func).toBe('function')

    })


    it('Calls register function and removes it from registerPluginList', () => {
        const plugins = [
            {
                id: 'se.infomaker.dummy',
                name: 'dummy',
                configure: () => {}
            }
        ]

        // Add a timeout before resolving the promise
        setTimeout(() => {
            pluginManager.registerPlugin(plugins[0])
        }, 300)

        return pluginManager.load(plugins)
            .then(data => expect(pluginManager.registerPluginList.size).toBe(0))

    })
})
