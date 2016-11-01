import Helper from '../../../helpers'
import sinon from 'sinon'
import {Component} from 'substance'


class DummyDialogContent extends Component {

    constructor(...args) {
        super(...args)
    }

    didMount() {
    }

    render($$) {
        let el = $$('div').addClass('dummy-dialog-content')
        if(this.props.foo) {
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
        xhr.onCreate = function (req) { requests.push(req); };

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

})