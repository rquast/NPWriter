let tags = []

class ResourceLoader {
    unload(url) {
        tags = tags.filter(tag => {
            if (tag.url === url) {
                tag.node.parentNode.removeChild(tag.node)
                return false
            }
            return true
        })
    }

    load(plugin, type) {
        var resource

        if (type === "js") {
            resource = document.createElement('script')
            resource.setAttribute("type", "text/javascript")
            resource.src = plugin.url
        } else if (type === "css") {
            resource = document.createElement('link')
            resource.setAttribute("type", "text/css")
            resource.setAttribute("rel", "stylesheet")
            resource.setAttribute("href", plugin.css)
        } else {
            Promise.reject("Tried to load invalid type" + type)
            return
        }

        // Check if tags with same url is already loaded,
        // In that case just resolve promise immediately
        if (tags.filter((t) => {
            return t.url === plugin.url
        }).length >= 1) {
            return Promise.resolve()
        }

        tags = [...tags, {url: plugin.url, node: resource}]

        if (type === "css") {
            document.getElementsByTagName("head")[0].appendChild(resource)
        } else {
            document.body.appendChild(resource)
        }

        return new Promise(function (resolve, reject) {
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
