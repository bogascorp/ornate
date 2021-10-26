var cacherAPI = function () {
    var cacheFolder = Windows.Storage.ApplicationData.current.localCacheFolder;
    var cacheQueue = new Array();
    var queueRunning = false;
    var count = 0;
    var cachePromise;
    /*
    * check cache for unique id
    * if found, retrive unique id back
    * if not found, get images based on image type
    * 
    */


    /*
    * @params { "tmdb": "", "imgid": "", "imgtype": "", "id": "" }
    */
    var clearCacheFolder = function () {
        return new Promise((resolve, reject) => {
            try {
                Windows.Storage.ApplicationData.current.clearAsync(Windows.Storage.ApplicationDataLocality.localCache);
                resolve();
            } catch (ex) { reject(); }
        });


    };
    var clearQueue = function () {
        return new Promise(function (resolve, reject) {
            cacheQueue = new Array();
            queueRunning = false;
            try {
                cachePromise.cancel();
            }
            catch (ex) {
                console.log(ex);
            }
            resolve();
        });
    };
    var addToQueue = function (params) {
        cacheQueue.push(params);
        if (!queueRunning)
            processQueue();
    }
    var processQueue = function () {
        queueRunning = true;
            if (cacheQueue.length > 0) {
                get(cacheQueue[0]).then(function (res) {
                    //console.log(res);
                    //trakt().debug("PROCESS IMAGE LOADING QUEUE");
                    //trakt().debug(res);
                    var elem = "#" + res.params.id;
                    $(elem).off("load").on("load", function () {
                        if (res.params.parentlvl === 1)
                            $(this).parent().addClass("isvisible");
                        else
                            $(this).parent().parent().addClass("isvisible");
                    }).attr("src", res.src);


                }, function (er) {
                    console.log("err1", er)
                });
                cacheQueue.shift();
            }

    }
    var preCache = function (sender, index, parentlvl) {
        var params = { "tvdb": sender.dataset.tvdb, "tmdb": sender.dataset.tmdb, "imgid": sender.dataset.imgid, "imgtype": sender.dataset.imgtype, "id": sender.id, "season": sender.dataset.season, "episode": sender.dataset.episode, "index": index, "parentlvl": parentlvl };

        //GET Directly
        
        getImages(params).then(function (res) {
            let file = '';
            switch (params.imgtype) {
                case "showfanartsmall": case "moviefanartsmall":
                    file = res.fanart.small;
                    break;
                case "showfanartbig": case "moviefanartbig":
                    file = res.fanart.big;
                    break;
                case "showpostersmall": case "seasonpostersmall": case "moviepostersmall":
                    file = (res.poster !== undefined) ? res.poster.small : '';
                    break;
                case "showposterbig": case "seasonposterbig": case "movieposterbig":
                    file = (res.poster !== undefined) ? res.poster.big : '';
                    break;
                case "screenshotsmall":
                    file = (res.screenshot !== undefined) ? res.screenshot.small : ((res.fanart !== false) ? res.fanart.small : '');
                    break;
                case "screenshotbig":
                    file = (res.screenshot !== undefined) ? res.screenshot.big : ((res.fanart !== false) ? res.fanart.big : '');
                    break;
                case "actorsmall":
                    file = (res.actor !== undefined) ? res.actor.small : '';
                    break;
                case "actorbig":
                    file = (res.actor !== undefined) ? res.actor.big : '';
                    break;
            }
            sender.onload = function () {
                if (parentlvl === 1)
                    $(sender).parent().addClass("isvisible");
                else
                    $(sender).parent().parent().addClass("isvisible");
            };
            sender.src = file;
        });
        
        



    };
    var get = function (params) {
        return getImages(params)
    }
    var checkCache = function (params) {
        
    }
    var getImages = function (params) {
        switch (params.imgtype) {
            case "showfanartsmall": case "showfanartbig":
                return tmdbAPI.getShowImages(params).then(function (res) {
                    return res;
                });
            case "moviefanartsmall": case "moviefanartbig":
                return tmdbAPI.getMovieImages(params).then(function (res) {
                    return res;
                });
            case "showpostersmall": case "showposterbig":
                return tmdbAPI.getShowImages(params).then(function (res) {
                    return res;
                });
            case "seasonpostersmall": case "seasonposterbig":
                return tmdbAPI.getSeasonImages(params).then(function (res) {
                    return res;
                });
            case "moviepostersmall": case "movieposterbig":
                return tmdbAPI.getMovieImages(params).then(function (res) {
                    return res;
                });
            case "screenshotsmall": case "screenshotbig":
                return tmdbAPI.getEpisodeImages(params).then(function (res) {
                    return res;
                });
            case "actorsmall": case "actorbig":
                return tmdbAPI.getPersonImages(params).then(function (res) {
                    return res;
                });
        }
    };




    var saveToCache = function (url, folder, filename) {
        var uri = new Windows.Foundation.Uri(url);
        var client = new Windows.Web.Http.HttpClient();
        return client.getInputStreamAsync(uri)
        .then(function (input) {
            return folder.createFileAsync(filename+'.jpg', Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {


                return file.openAsync(Windows.Storage.FileAccessMode.readWrite)
                .then(function (output) {
                    return Windows.Storage.Streams.RandomAccessStream.copyAsync(input, output).then(function () {
                        return output.flushAsync().then(function () {
                            input.close();
                            output.close();
                            return file;
                        });
                    }, function (err) { trakt().debug(err); })
                })
            })
        }, function (err) { trakt().debug(err); })
    }
    



    return {
        get: get,
        preCache: preCache,
        addToQueue: addToQueue,
        clearQueue: clearQueue,
        clearCacheFolder: clearCacheFolder
    }
}();