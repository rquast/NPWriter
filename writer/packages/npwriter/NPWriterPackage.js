import './scss/_content-menu.scss'

// Base packages
import {BasePackage, StrongPackage, EmphasisPackage, LinkPackage} from 'substance'

import NewsMLArticle from './NewsMLArticle'
import NewsMLImporter from './NewsMLImporter'
import NewsMLExporter from './NewsMLExporter'

import BodyPackage from '../body/BodyPackage'
import HeadlinePackage from '../headline/HeadlinePackage'
import SubheadlinePackage from '../subheadline/SubheadlinePackage'
import ParagraphPackage from '../paragraph/ParagraphPackage'
import BlockquotePackage from '../blockquote/BlockquotePackage'
import SwitchTextTypePackage from '../switch-text-type/SwitchTextTypePackage'
import ConfigEditorPackage from '../config-editor/ConfigEditorPackage'

// import PreamblePackage from '../preamble/PreamblePackage'


export default {
    name: 'npwriter',
    configure: function (config) {
        config.defineSchema({
            name: 'newsml-article',
            ArticleClass: NewsMLArticle,
            defaultTextType: 'paragraph'
        })

        // core nodes
        config.import(StrongPackage, {toolTarget: 'overlay'})
        config.import(EmphasisPackage, {toolTarget: 'overlay'})
        config.import(LinkPackage, {toolTarget: 'overlay'})

        // content-nodes
        config.import(BodyPackage)
        config.import(HeadlinePackage)
        config.import(SubheadlinePackage)
        config.import(ParagraphPackage)
        config.import(BlockquotePackage)

        config.import(ConfigEditorPackage)

        // general purpose
        config.import(BasePackage)
        config.import(SwitchTextTypePackage)

        config.addIcon('content-menu-open', {'fontawesome': 'fa-pencil'});
        config.addIcon('content-menu-close', {'fontawesome': 'fa-times'});

        // Override Importer/Exporter
        config.addImporter('newsml', NewsMLImporter)
        config.addExporter('newsml', NewsMLExporter)
        // config.addExporter('jats', AuthorExporter);
    }
}
