import NPWriterConfigurator from '../../../../writer/packages/npwriter/NPWriterConfigurator'
import AppPackage from '../../../../writer/AppPackage'

describe('Add validators to configuration', () => {

    let configurator
    beforeEach(() => {
       let configurator = new NPWriterConfigurator().import(AppPackage)
    })

    it('Adds a validator to configuration', () => {

        // var configuratorPackage = {
        //     configure: () => {}
        // }

        let configurator = new NPWriterConfigurator()

        expect(configurator.config.validators.length).toBe(0)

    })

})