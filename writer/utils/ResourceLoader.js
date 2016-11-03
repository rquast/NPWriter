class ResourceLoader {

    constructor() {
        this.tags = []
    }

    unload(url) {
        this.tags = this.tags.filter(tag => {
            if (tag.url === url) {
                tag.node.parentNode.removeChild(tag.node)
                return false
            }
            return true
        })
    }

    /**
     * Appends a element to DOM
     * @param plugin
     * @param type
     * @returns {*}
     */
    load(plugin, type) {
        let resource

        // Check if tags with same url is already loaded,
        // In that case just resolve promise immediately
        if (this.tags.filter((t) => {
            return t.url === plugin.url
        }).length >= 1) {
            return Promise.resolve()
        }

        if (type === "js") {
            resource = document.createElement('script')
            resource.setAttribute("type", "text/javascript")
            resource.src = plugin.url
        } else if (type === "css") {
            resource = document.createElement('link')
            resource.setAttribute("type", "text/css")
            resource.setAttribute("rel", "stylesheet")
            resource.setAttribute("href", plugin.style)
        } else {
            return Promise.reject("Tried to load invalid type" + type)
        }

        this.tags = [...this.tags, {url: plugin.url, node: resource}]
        if (type === "css") {
            document.getElementsByTagName("head")[0].appendChild(resource)
        } else {
            document.body.appendChild(resource)
        }

        return new Promise(function (resolve, reject) {
            if (type === "css") {
                // Hack
                // Since the link element does not fire onload event we need to resolve promise
                resolve()
            }
            resource.onload = () => {
                resolve()
            }
            resource.onerror = () => {
                if (plugin.mandatory) {
                    reject("Failed adding plugin " + plugin.id)
                } else {
                    resolve()
                }
            }
        })
    }
}

export default ResourceLoader
