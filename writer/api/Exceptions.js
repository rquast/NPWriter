export default {
    /**
     * @class NotFoundException
     * @param {string} message
     */
    NotFoundException: function NotFoundException(message) {
        this.message = message;
        this.name = "NotFoundException";
    }
};
