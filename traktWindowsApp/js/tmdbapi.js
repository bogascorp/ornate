var tmdbAPI = function () {
    var isTest = false;
    var apiKey = '';
    var baseURL = 'https://api.themoviedb.org/3';
    var imageSizes = {"fanartBig" : 'original', "fanartSmall" : 'w780', "posterBig" : 'original', "posterSmall" : 'w500', "profileBig" : 'original', "profileSmall" : 'h632'};
    var imageBase = (Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri'] : false;


    var endpoints = {
        'configuration': '/configuration',
        'getMovieImages': '/movie/{movieid}',
        'getShowImages': '/tv/{tv_id}',
        'getEpisodeImages': '/tv/{tv_id}/season/{season_number}/episode/{episode_number}/images',
        'getPersonImages': '/person/{person_id}',
        'getSeasonImages': '/tv/{tv_id}/season/{season_number}'
    }

    var getMovieImages = function (params) {
        var url = endpoints['getMovieImages'];
        url = url.replace("{movieid}", params.tmdb);
        return getInfo(url).then(function (result) {
            //trakt().debug("GET MOVIE IMAGES");
            //trakt().debug(result);
                return {
                    "poster": {
                        "big": convert(result.poster_path, imageSizes.posterBig),
                        "small": convert(result.poster_path, imageSizes.posterSmall)
                    },
                    "fanart": {
                        "big": convert(result.backdrop_path, imageSizes.fanartBig),
                        "small": convert(result.backdrop_path, imageSizes.fanartSmall)
                    }
                };
        }, function () {
            return { "poster": false };
        });
    }
    var getShowImages = function (params) {
        var url = endpoints['getShowImages'];
        url = url.replace("{tv_id}", params.tmdb);
        return getInfo(url).then(function (result) {
            //trakt().debug("GET SHOW IMAGES");
            //trakt().debug(result);
                return {
                    "poster": (result.poster_path != "") ? {
                        "big": convert(result.poster_path, imageSizes.posterBig),
                        "small": convert(result.poster_path, imageSizes.posterSmall)
                    } : false,
                    "fanart": (result.backdrop_path != "") ? {
                        "big": convert(result.backdrop_path, imageSizes.fanartBig),
                        "small": convert(result.backdrop_path, imageSizes.fanartSmall)
                    } :false
                    
                };
        }, function () {
            return { "poster": false };
        });
    }
    var getSeasonImages = function (params) {
        var url = endpoints['getSeasonImages'];
        url = url.replace("{tv_id}", params.tmdb);
        url = url.replace("{season_number}", params.season);
        return getInfo(url).then(function (result) {
            if (result.poster_path !="")
                return {
                    "poster": {
                        "big": convert(result.poster_path, imageSizes.fanartBig),
                        "small": convert(result.poster_path, imageSizes.fanartSmall)
                    }
                };
            else return { "poster": false };
        }, function () {
            return { "poster": false };
        });
    }
    var getEpisodeImages = function (params) {
        var url = endpoints['getEpisodeImages'];
        url = url.replace("{tv_id}", params.tmdb);
        url = url.replace("{season_number}", params.season);
        url = url.replace("{episode_number}", params.episode);
        return getInfo(url).then(function (result) {
            //console.info(result);
            if (result.stills && result.stills.length > 0)
                return {
                    "screenshot": {
                        "big": convert(((result.stills.length > 0) ? result.stills[0].file_path : result.stills.file_path), imageSizes.fanartBig),
                        "small": convert(((result.stills.length > 0) ? result.stills[0].file_path : result.stills.file_path), imageSizes.fanartSmall)
                    }
                };
            else return { "screenshot": false};
        }, function (reason) {
            console.log(reason);
            return { "screenshot": false };
        });
    }
    var getPersonImages = function (params) {
        var url = endpoints['getPersonImages'];
        url = url.replace("{person_id}", params.tmdb);
        return getInfo(url).then(function (result) {
            if (result.profile_path !="")
                return {
                    "actor": {
                        "big": convert(result.profile_path, imageSizes.profileBig),
                        "small": convert(result.profile_path, imageSizes.profileSmall)
                    }
                };
            else return { "actor": false };
        }, function () {
            return { "actor": false };
        });
    }
    var configuration = function () {
        var url = endpoints['configuration'];
        getInfo(url).then(function (result) {
            Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri'] = result.images.base_url;
            console.log("got code", url, Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri']);
            
        });
    }
    var convert = function (filename, type) {
        return imageBase + type + filename;

    }

    var getInfo = function (url, data) {
        var modUrl = baseURL + url + '?api_key=' + apiKey + '&language=en';
        var data = data || {};

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", modUrl);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    }
                    catch (ex) {
                        resolve(xhr.response);
                    }
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send(null);
        });

    }

    return {
        configuration: configuration,
        getMovieImages: getMovieImages,
        getShowImages: getShowImages,
        getSeasonImages:getSeasonImages,
        getEpisodeImages: getEpisodeImages,
        getPersonImages:getPersonImages,
        convert: convert
    }
}();