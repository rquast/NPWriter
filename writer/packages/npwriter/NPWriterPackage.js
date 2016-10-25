import './scss/_content-menu.scss'

// Base packages
import {BasePackage, StrongPackage, EmphasisPackage, LinkPackage, OverlayPackage} from 'substance'

import NewsMLArticle from './NewsMLArticle'
import NewsMLImporter from './NewsMLImporter'
import NPWriterDragAndDropHandler from './NPWriterDragAndDropHandler'

import BodyPackage from '../body/BodyPackage'
import HeadlinePackage from '../headline/HeadlinePackage'
import SubheadlinePackage from '../subheadline/SubheadlinePackage'
import ParagraphPackage from '../paragraph/ParagraphPackage'
import BlockquotePackage from '../blockquote/BlockquotePackage'
import SwitchTextTypePackage from '../switch-text-type/SwitchTextTypePackage'
import ConfigEditorPackage from '../config-editor/ConfigEditorPackage'

export default {
    name: 'npwriter',
    configure: function (config) {
        config.defineSchema({
            name: 'newsml-article',
            ArticleClass: NewsMLArticle,
            defaultTextType: 'paragraph'
        })

        // basics
        config.import(BasePackage)
        config.addToolGroup('content-menu')

        // core nodes
        config.import(StrongPackage, {toolGroup: 'overlay'})
        config.import(EmphasisPackage, {toolGroup: 'overlay'})
        config.import(LinkPackage, {toolGroup: 'overlay'})

        // content-nodes
        config.import(BodyPackage)
        config.import(HeadlinePackage)
        config.import(SubheadlinePackage)
        config.import(ParagraphPackage)
        config.import(BlockquotePackage)

        config.import(ConfigEditorPackage)

        // general purpose
        config.import(SwitchTextTypePackage)

        config.addIcon('content-menu-open', {'fontawesome': 'fa-pencil'});
        config.addIcon('content-menu-close', {'fontawesome': 'fa-times'});

        // Override Importer/Exporter
        config.addImporter('newsml', NewsMLImporter)

        config.addDragAndDrop(NPWriterDragAndDropHandler)
    }
}
