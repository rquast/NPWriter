import includes from 'lodash/includes'
import isArray from 'lodash/isArray'


class Upload {

    uploadFile(file, params, observer) {
        if (params.allowedMimeTypes &&
            isArray(params.allowedMimeTypes) && !includes(
                params.allowedMimeTypes, file.type)) {
            if (observer.error) {
                observer.error("Unsupported mimetype: " + file.type);
                return false;
            }
        }

        if (window.FileReader) {
            var reader = new window.FileReader();
            var router = this.router;
            reader.onload = function (evt) {

                if (observer.preview) {
                    observer.preview(evt ? evt.target.result : null);
                }
                uploadFile(router, file, observer, params);
            };
            reader.readAsDataURL(file);
            return true;
        } else {
            if (observer.error) {
                observer.error("Browser has no FileReader support");
                return false;
            }
        }
    }


    uploadUri(uri, params, observer) {
        if (observer.preview) {
            observer.preview(null);
        }

        if (observer.progress) {
            observer.progress(0);
        }

        var router = this.router;

        this.router.get('/api/image', {source: uri}).done(function (data) {
            if (observer.progress) {
                observer.progress(100);
            }

            if (observer.done) {

                var dom = $.parseXML(data),
                    newsItem = dom.querySelector('newsItem'),
                    uuid = newsItem.getAttribute('guid'),
                    itemClass = dom.querySelector(
                        'newsItem > itemMeta > itemClass').getAttribute('qcode');

                var allowedItemClasses = getParam(params, 'allowedItemClasses', undefined);

                if (allowedItemClasses) {
                    if (!includes(allowedItemClasses, itemClass)) {
                        if (observer.error) {
                            observer.error("Item class " + itemClass + " not supported");
                        }
                        return;
                    }
                }

                var w = getParam(params, 'imageSize/w', undefined);
                var h = getParam(params, 'imageSize/h', undefined);

                var url = '/api/image/url/' + uuid;
                if (h) {
                    url = url + '/' + h;
                }
                if (w) {
                    url = url + "?width=" + w;
                }

                router.get(url)
                    .done(
                        function (imageUrl) {
                            if (observer.done) {
                                observer.done({dom: dom, imageUrl: imageUrl});
                            } else {
                                console.log("Missing 'done'");
                            }
                        }
                    );
            }

        }).error(function (e) {
            if (observer.error) {
                observer.error(e);
            }
        });
    }
}


function getParam(params, keys, defaultValue) {
    var result = params;
    var keysArray = keys.split('/');
    for (var i = 0; i < keysArray.length; i++) {
        if (result[keysArray[i]]) {
            result = result[keysArray[i]];
        } else {
            return defaultValue;
        }
    }

    return result;
}


function uploadFile(router, file, observer, params) {
    try {
        router.postBinary(
            '/api/image',
            file,
            function (evt) {
                // Never set 100% as that is only set in onLoad
                var progress = (evt.loaded / evt.total) * 100;
                if (observer.progress) {
                    observer.progress(progress);
                }
            },
            function (evt) {

                try {
                    // If status ok, update document with image and return
                    if (evt.target.status === 200) {

                        var dom = $.parseXML(evt.target.responseText),
                            newsItem = dom.querySelector('newsItem'),
                            uuid = newsItem.getAttribute('guid'),
                            itemClass = dom.querySelector(
                                'newsItem > itemMeta > itemClass').getAttribute('qcode');

                        var allowedItemClasses = getParam(params, 'allowedItemClasses', undefined);

                        if (allowedItemClasses) {
                            if (!includes(allowedItemClasses, itemClass)) {
                                if (observer.error) {
                                    observer.error("Item class " + itemClass + " not supported");
                                }
                                return;
                            }
                        }


                        var w = getParam(params, 'imageSize/w', undefined);
                        var h = getParam(params, 'imageSize/h', undefined);

                        var url = '/api/image/url/' + uuid;
                        if (h) {
                            url = url + '/' + h;
                        }
                        if (w) {
                            url = url + "?width=" + w;
                        }

                        router.get(url)
                            .done(
                                function (imageUrl) {
                                    if (observer.done) {
                                        observer.done({dom: dom, imageUrl: imageUrl});
                                    } else {
                                        console.log("Missing 'done'");
                                    }
                                }
                            )
                            .error(function (e) {
                                if (observer.error) {
                                    observer.error(e);
                                }
                            });
                        return true;
                    } else {
                        if (observer.error) {
                            observer.error(evt.target);
                        }
                    }

                }
                catch (ex) {
                    if (observer.error) {
                        observer.error(ex.message);
                    }
                }
            },
            function (e) {
                if (observer.error) {
                    console.log(e);
                    observer.error(e);
                }
            }
        );
    } catch (e) {
        if (observer.error) {
            observer.error(e.message);
        }
    }
}

export default Upload