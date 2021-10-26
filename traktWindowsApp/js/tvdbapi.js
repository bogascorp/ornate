var tvdbAPI = function () {
    var isTest = false;
    var apiKey = '';
    var baseURL = 'https://api.thetvdb.com';
    var accessToken = (Windows.Storage.ApplicationData.current.roamingSettings.values['tvdb_token']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['tvdb_token'] : false;
    var imageBase = 'http://thetvdb.com/banners/';


    var endpoints = {
        'login': '/login',
        'seriesImages': '/series/{id}/images/query',
        'episodeImages':'/episodes/{id}'
    }


    var getSeasonImages = function (params) {
        if (accessToken) {
            var url = endpoints['seriesImages'] + '?keyType=season&subKey=' + params.season;
            url = url.replace("{id}", params.tvdb);
            return getInfo(url).then(function (result) {
                if (result.data.length > 0) {
                    var res = Math.max.apply(Math, result.data.map(function (o) { return o.ratingsInfo.average; }))
                    var obj = result.data.find(function (o) { return o.ratingsInfo.average == res; })
                    return {
                        "poster": {
                            "big": convert(obj.fileName),
                            "small": convert(obj.thumbnail)
                        }
                    };
                }
                else return { "poster": false };
            });
        }
    }
    var getShowPoster = function (params) {
            var url = endpoints['seriesImages'] + '?keyType=poster';
            url = url.replace("{id}", params.tvdb);
            return getInfo(url).then(function (result) {
                if (result.data.length > 0) {
                    var res = Math.max.apply(Math, result.data.map(function (o) { return o.ratingsInfo.average; }));
                    var obj = result.data.find(function (o) { return o.ratingsInfo.average == res; });
                    return {
                        "poster": {
                            "big": convert(obj.fileName),
                            "small": convert(obj.thumbnail)
                        }
                    };
                }
                else return { "poster": false };
            });

    }
    var getShowFanart = function (params) {
            var url = endpoints['seriesImages'] + '?keyType=fanart';
            url = url.replace("{id}", params.tvdb);
            return getInfo(url).then(function (result) {
                if (result.data.length > 0) {
                    var res = Math.max.apply(Math, result.data.map(function (o) { return o.ratingsInfo.average; }));
                    var obj = result.data.find(function (o) { return o.ratingsInfo.average == res; });
                    return {
                        "fanart": {
                            "big": convert(obj.fileName),
                            "small": convert(obj.thumbnail)
                        }
                    };
                }
                else return { "fanart": false };
            });
    }
    var getEpisodeImages = function (params) {
            var url = endpoints['episodeImages'];
            url = url.replace("{id}", params.tvdb);
            return getInfo(url).then(function (result) {
                if (result.data.fileName != "")
                    return {
                        "screenshot": {
                            "big": convert(result.data.filename),
                            "small": convert(result.data.filename)
                        }
                    };
                else return { "screenshot": false };
            });
    }
 
    var getPersonImages = function (params) {
        var url = endpoints['getPersonImages'];
        url = url.replace("{person_id}", params.tmdb);
        return getInfo(url).then(function (result) {
            return {
                "actor": {
                    "big": convert(((result.profiles.length > 0) ? result.profiles[0].file_path : result.profiles.file_path), imageSizes.profileBig),
                    "small": convert(((result.profiles.length > 0) ? result.profiles[0].file_path : result.profiles.file_path), imageSizes.profileSmall)
                }
            };
        });
    }



    var login = function () {
        var modUrl = baseURL + endpoints['login'] + '?api_key=' + apiKey;
        var Request = new XMLHttpRequest();
        Request.open('POST', modUrl);
        Request.setRequestHeader('Content-Type', 'application/json');
        Request.onreadystatechange = function () {
            if (this.readyState === 4) {
                var res = JSON.parse(this.responseText);
                accessToken = res.token;
                Windows.Storage.ApplicationData.current.roamingSettings.values['tvdb_token'] = res.token;
            }
        };
        var body = {
            'apikey': apiKey
        };
        Request.send(JSON.stringify(body));
    }
    var convert = function (filename) {
        return imageBase + filename;

    }


    var setHeader = function (xhr) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    }
    var getInfo = function (url, data) {
        var modUrl = baseURL + url;
        var data = data || {};

        var jqxhr = $.ajax({
            url: modUrl,
            type: 'GET',
            dataType: 'json',
            data: data,
            beforeSend: setHeader,
            contentType: 'application/json'
        });
        return jqxhr;
    }

    return {
        login: login,
        getSeasonImages: getSeasonImages,
        getShowPoster: getShowPoster,
        getShowFanart: getShowFanart,
        getEpisodeImages: getEpisodeImages,
        getPersonImages:getPersonImages
    }
}();