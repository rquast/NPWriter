class Ui {
    constructor(api) {
        this.api = api
    }

    showNotification(name, title, message) {
        this.api.triggerEvent('name', 'notification:add', {
            plugin: name,
            title: title,
            message: message
        });
    }
}
export default Ui