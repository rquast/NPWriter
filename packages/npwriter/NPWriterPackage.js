// Base packages
import { BasePackage } from 'substance'

import NewsMLArticle from './NewsMLArticle'
import NewsMLImporter from './NewsMLImporter'

import BodyPackage from '../body/BodyPackage'
import ParagraphPackage from '../paragraph/ParagraphPackage'
import HeadlinePackage from '../headline/HeadlinePackage'
import SubheadlinePackage from '../subheadline/SubheadlinePackage'
import UnsupportedPackage from '../unsupported/UnsupportedPackage'
import SwitchTextTypePackage from '../switch-text-type/SwitchTextTypePackage'

export default {
    name: 'npwriter',
    configure: function(config) {
        config.defineSchema({
            name: 'newsml-article',
            ArticleClass: NewsMLArticle,
            defaultTextType: 'paragraph'
        })

        // content-nodes
        config.import(BodyPackage)
        config.import(ParagraphPackage)
        config.import(HeadlinePackage)
        config.import(SubheadlinePackage)
        config.import(UnsupportedPackage)

        // general purpose
        config.import(BasePackage)
        config.import(SwitchTextTypePackage)

        config.addIcon('content-menu-open', { 'fontawesome': 'fa-pencil'});
        config.addIcon('content-menu-close', { 'fontawesome': 'fa-times'});

        // Override Importer/Exporter
        config.addImporter('newsml', NewsMLImporter)
        // config.addExporter('jats', AuthorExporter);
    }
}
