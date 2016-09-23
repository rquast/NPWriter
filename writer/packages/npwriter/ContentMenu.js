import { Component } from 'substance'

class ContentMenu extends Component {
    getInitialState() {
        return { open: false }
    }

    render($$) {
        var contentTools = this.context.tools.get('content-menu') || new Map();
        var commandStates = this.props.commandStates;
        var Button = this.getComponent('button');

        var el = $$('div').addClass('sc-content-menu');

        if (contentTools.size > 0) {
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

                contentTools.forEach(function(tool, toolName) {
                    var toolProps = Object.assign({}, commandStates[toolName])

                    toolProps.name = toolName
                    toolProps.icon = toolName
                    // outline button style will be used
                    toolProps.style = 'outline'

                    if (!toolProps.disabled) {
                        availableToolsEl.append(
                            $$(tool.Class, toolProps)
                        )
                    }
                });
                el.append(availableToolsEl);
            }
        }
        return el;
    }

    willReceiveProps() {
        this.extendState({
            open: false
        });
    }


    didRender() {
        // TODO: positioning needs to be re-enabled with a better
        // strategy

        // var hints = this.state.hints;
        // if (hints) {
        //     this.$el.css('top', hints.position.y);
        //     // HACK: better do this via HTML/CSS
        //     this.$el.css('left', hints.position.x - 30);
        // }

        // if (this.state.open === true) {
        //     $('.se-available-tools >.se-tool:first-child').focus();
        // }
    }

    onToggle() {
        this.extendState({
            open: !this.state.open
        })
    }
}


export default ContentMenu
