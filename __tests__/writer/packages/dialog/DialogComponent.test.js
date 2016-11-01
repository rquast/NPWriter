import Helper from '../../../helpers'
import sinon from 'sinon'
import {Component} from 'substance'


class DummyDialogContent extends Component {

    constructor(...args) {
        super(...args)
    }

    didMount() {

    }

    onClose(action) {
        return true
    }

    render($$) {
        let el = $$('div').addClass('dummy-dialog-content')
        if (this.props.foo) {
            el.append($$('div').attr('id', this.props.foo))
        }

        el.append("My test dialog")

        return el
    }

}

describe('Open a modal window', () => {

    let xhr, requests, App, app
    beforeEach(() => {
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function (req) {
            requests.push(req);
        };

        App = Helper.getApp()
        app = App.mount({configurator: Helper.getConfigurator()}, document.body)
    })

    afterEach(() => {
        document.body.innerHTML = '<div></div>';
        xhr.restore();
    })


    test('It can open a modal window through the API', () => {
        app.api.ui.showDialog(DummyDialogContent, {}, {})

        const body = document.body
        expect(body.querySelectorAll('.modal').length).toBe(1)
        expect(body.querySelectorAll('.dummy-dialog-content').length).toBe(1)
        const dialogContent = body.querySelector('.dummy-dialog-content')
        expect(dialogContent.textContent).toBe('My test dialog')
    })


    test('It can open modal with passed in props', () => {
        app.api.ui.showDialog(DummyDialogContent, {foo: 'bar'}, {})
        const body = document.body
        expect(body.querySelector('#bar').getAttribute('id')).toBe('bar')
    })


    test('It can add primary button with onClose called with save action', () => {

        var callback = sinon.spy();

        class Dialog extends DummyDialogContent {
            onClose(action) {
                if (action === 'save') {
                    callback()
                }
                return true
            }
        }

        app.api.ui.showDialog(Dialog, {}, {primary: "Go"})
        const body = document.body
        const primaryButton = body.querySelectorAll('.btn-primary')[0]

        expect(body.querySelectorAll('.btn-primary').length).toBe(1)

        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, false);
        primaryButton.dispatchEvent(evt);

        expect(callback.called).toBe(true)
        expect(body.querySelectorAll('.btn-primary').length).toBe(0)
    })


    /**
     * Test so we can add attribute disabled by sending actions
     */
    test('It can disable primary button with actions', () => {

        class Dialog extends DummyDialogContent {
            didMount() {
                this.send('dialog:disablePrimaryBtn')
            }
        }

        app.api.ui.showDialog(Dialog, {}, {primary: "Go"})
        const body = document.body

        const primaryButton = body.querySelectorAll('.btn-primary')[0]
        expect(primaryButton.getAttribute('disabled')).toBe('true')
    })


    test('It adds a title if provided', () => {
        app.api.ui.showDialog(DummyDialogContent, {}, {title: "My Title"})
        const body = document.body

        expect(body.querySelector('.modal-header').getAttribute('class')).toBe('modal-header')
        expect(body.querySelector('.modal-header > h2').textContent).toBe('My Title')
    })


    test('It does NOT add a title', () => {
        app.api.ui.showDialog(DummyDialogContent, {}, {})
        const body = document.body

        expect(body.querySelector('.modal-header')).toBe(null)
    })


    test('It can add secondary button and onClose called with cancel action', () => {
        var callback = sinon.spy();

        class Dialog extends DummyDialogContent {
            onClose(action) {
                if (action === 'cancel') {
                    callback()
                }
                return true
            }
        }

        app.api.ui.showDialog(Dialog, {}, {secondary: "Cancel"})
        const body = document.body
        const primaryButton = body.querySelectorAll('.btn-secondary')[0]

        expect(body.querySelectorAll('.btn-secondary').length).toBe(1)

        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, false);
        primaryButton.dispatchEvent(evt);

        expect(callback.called).toBe(true)
        expect(body.querySelectorAll('.btn-secondary').length).toBe(0)
    })


    test('It can add a single tertiary button with callback', () => {
        const sinonCallback = sinon.spy()

        const button = [{
            caption: "Third",
            callback: () => {
                sinonCallback()
                return true;
            }
        }]

        app.api.ui.showDialog(DummyDialogContent, {}, {tertiary: button})
        const body = document.body
        const tertiaryButton = body.querySelectorAll('.btn-tertiary')[0]

        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, false);
        tertiaryButton.dispatchEvent(evt);

        expect(tertiaryButton.textContent).toBe('Third')
        expect(tertiaryButton).not.toBe(null)
        expect(sinonCallback.called).toBe(true)

    })


    test('It can add multiple tertiary button with callbacks', () => {
        const sinonCallback = sinon.spy()
        const sinonSecondCallback = sinon.spy()

        const buttons = [{
            caption: "Third",
            callback: () => {
                sinonCallback()
                return true;
            }
        },
            {
                caption: "Fourth",
                callback: () => {
                    sinonSecondCallback()
                    return true;
                }
            }]

        app.api.ui.showDialog(DummyDialogContent, {}, {tertiary: buttons})
        const body = document.body
        const tertiaryButtons = body.querySelectorAll('.btn-tertiary')

        expect(tertiaryButtons.length).toBe(2)

        const firstTertiaryButton = tertiaryButtons[0]
        const secondTertiaryButton = tertiaryButtons[1]

        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, false);
        firstTertiaryButton.dispatchEvent(evt);

        var secondevt = document.createEvent('MouseEvents');
        secondevt.initEvent('click', true, false);
        secondTertiaryButton.dispatchEvent(secondevt);

        expect(secondTertiaryButton.textContent).toBe('Fourth')
        expect(sinonCallback.called).toBe(true)
        expect(sinonSecondCallback.called).toBe(true)

        // The modal should been closed
        expect(body.querySelectorAll('.dummy-dialog-content').length).toBe(0)
    })


})