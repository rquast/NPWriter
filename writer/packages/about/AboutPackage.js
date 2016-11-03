import './scss/about.scss'

import AboutComponent from './AboutComponent'

export default {
    name: 'about',
    configure: function(config) {
        config.addPopover(
            'npwriterabout',
            {
                icon: '/data/assets/icon.svg',
                align: 'left',
                css: {
                    width: '30px',
                    height: '30px'
                }
            },
            AboutComponent
        )


        config.addLabel('about-header', {
            en: "NP Writer 2.0",
            sv: "NP Writer 2.0"
        })

        config.addLabel('about-description', {
            en: "NewsPilot Writer is brought to you by Infomaker Scandinavia AB and was first released in early 2016.",
            sv: "NewsPilot Writer skapad av Infomaker Scandinavia AB och släpptes första gången våren 2016."
        })

        config.addLabel('about-credits', {
            en: "Core team and credits",
            sv: "Team och credits",
        })
    }
}
