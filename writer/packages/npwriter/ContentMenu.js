import { Component } from 'substance'

class ContentMenu extends Component {
    getInitialState() {
        return { open: false }
    }

    render($$) {
        var contentTools = this._getContentTools()
        var Button = this.getComponent('button')

        var el = $$('div').addClass('sc-content-menu')

        if (contentTools.length > 0) {
            var toggleEl = $$('div')
                .addClass('se-toggle')
                .on('click', this.onToggle);

            el.append(toggleEl);

            if (!this.state.open) {
                toggleEl.append(
                    $$(Button, {icon: 'content-menu-open' })
                );
            }
            else {
                toggleEl.append(
                    $$(Button, {icon: 'content-menu-close' })
                );
                var availableToolsEl = $$('div').addClass('se-available-tools se-l-arrow-box');

                el.addClass('sm-content-tools-open');

                contentTools.forEach(tool => {
                    availableToolsEl.append(
                      $$(tool.Class, tool.toolProps).ref(tool.toolProps.name)
                    )
                })
                el.append(availableToolsEl);
            }
        }
        return el;
    }

    _getContentTools() {
        let commandStates = this.props.commandStates
        let tools = this.context.tools
        let overlayTools = tools.get('content-menu') || new Map()
        let activeTools = []
        overlayTools.forEach((tool, toolName) => {
            let toolProps = Object.assign({}, commandStates[toolName], {
                name: toolName,
                // rendering hints only interprerted by generic Tool class
                // (= outlined button)
                icon: toolName,
                style: 'outline'
            })
            if (!toolProps.disabled) {
                activeTools.push({
                    Class: tool.Class,
                    toolProps: toolProps
                })
            }
        })
        return activeTools
    }

    /*
        Substance GutterContainer will ask if the gutter element
        should be visible.
    */
    isVisible() {
        return this._getContentTools().length > 0
    }

    willReceiveProps() {
        this.extendState({
            open: false
        });
    }

    onToggle() {
        this.extendState({
            open: !this.state.open
        })
    }
}

export default ContentMenu
