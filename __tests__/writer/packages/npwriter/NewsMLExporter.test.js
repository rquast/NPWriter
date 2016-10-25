import NPWriterConfigurator from '../../../../writer/packages/npwriter/NPWriterConfigurator'
import AppPackage from '../../../../writer/AppPackage'
import NewsMLImporter from '../../../../writer/packages/npwriter/NewsMLImporter'
import NewsMLExporter from '../../../../writer/packages/npwriter/NewsMLExporter'
import UnsupportedPackage from '../../../../writer/packages/unsupported/UnsupportedPackage'
import Helper from '../../../helpers'
import NewsMLArticle from '../../../../writer/packages/npwriter/NewsMLArticle'

describe('Import and export document results in no loss or change', () => {

    let configurator
    beforeEach(() => {
        configurator = new NPWriterConfigurator().import(AppPackage)
        configurator.import(UnsupportedPackage)
    })

    it('Can create an importer', () => {
        const importer = configurator.createImporter('newsml')
        expect(importer.config.schema.name).toBe('newsml-article')
        expect(importer instanceof NewsMLImporter).toBe(true)
    })

    it('Can import document', () => {
        const importer = configurator.createImporter('newsml')
        const xmlDocument = Helper.getContentFromExampleDocument()
        const document = importer.importDocument(xmlDocument)

        expect(document instanceof NewsMLArticle).toBe(true)

    })


    it('Can export document', () => {
        const importer = configurator.createImporter('newsml')
        try {
            const xmlDocument = Helper.getParsedExampleDocument()
            console.log("XML", xmlDocument);
        } catch (e) {
            console.log("ERROR", e);
        }

        // const document = importer.importDocument(xmlDocument)

        // const exporter = configurator.createExporter('newsml')

        // console.log("PARSED", xmlDocument);
        // exporter.convert(document, {}, Helper.getContentFromExampleDocument())


    })




})