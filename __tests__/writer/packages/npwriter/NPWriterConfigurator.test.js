import {Component} from 'substance'
import NPWriterConfigurator from '../../../../writer/packages/npwriter/NPWriterConfigurator'
import AppPackage from '../../../../writer/AppPackage'

describe('Add validators to configuration', () => {

    let configurator
    beforeEach(() => {
       configurator = new NPWriterConfigurator().import(AppPackage)
    })

    it('Adds a validator to configuration', () => {
        expect(configurator.config.validators.length).toBe(0)
    })

    it('Adds a component to a given tab', () => {

        class dummyComponent extends Component {

        }

        configurator.addComponentToSidebarWithTabId('dummy', 'dummy', dummyComponent)
        expect(configurator.getSidebarPanels().length).toBe(1)


    })

})