// Base packages
import { BasePackage } from 'substance'

import NewsMLArticle from './NewsMLArticle'
import NewsMLImporter from './NewsMLImporter'
import BodyPackage from '../body/BodyPackage'
import ParagraphPackage from '../paragraph/ParagraphPackage'
import HeadlinePackage from '../headline/HeadlinePackage'
import UnsupportedPackage from '../unsupported/UnsupportedPackage'

export default {
    name: 'npwriter',
    configure: function(config) {
        config.defineSchema({
            name: 'newsml-article',
            ArticleClass: NewsMLArticle,
            defaultTextType: 'paragraph'
        })

        // Now import base packages
        config.import(BasePackage)
        config.import(BodyPackage)
        config.import(ParagraphPackage)
        config.import(HeadlinePackage)
        config.import(UnsupportedPackage)

        // Override Importer/Exporter
        config.addImporter('newsml', NewsMLImporter)
        // config.addExporter('jats', AuthorExporter);
    }
}