var traktAPI = function () {
    var isTest = false;
    var clientID = '';
    var clientSecret = '';
    var baseURL = 'https://api.trakt.tv';

    var accessToken = (Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] : false;
    var refreshToken = (Windows.Storage.ApplicationData.current.roamingSettings.values['trk_refreshtoken']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['trk_refreshtoken'] : false;
    var endpoints = {
        'getUsersProfile': '/users/{profilename}',
        'getUsersSettings': '/users/settings',
        'getUsersWatching': '/users/{profilename}/watching',
        'getUsersWatched': '/users/{profilename}/watched/{type}',
        'getUsersWatchlist': '/users/{profilename}/watchlist/{type}',

        'postComment':      '/comments',
        'deleteComment':    '/comments/{id}',
        'doCheckin':        '/checkin',
        'addToCollection':  '/sync/collection',
        'addToWatchlist':   '/sync/watchlist',
        'addToHistory':     '/sync/history',
        'addRating':        '/sync/ratings',


        'getTrendingShows':             '/shows/trending',
        'getPopularShows':              '/shows/popular',
        'getMostAnticipatedShows':      '/shows/anticipated/', 


        'getMostPlayedShows':           '/shows/played/{period}', //weekly
        'getMostWatchedShows':          '/shows/watched/{period}', //weekly
        'getMostCollectedShows':        '/shows/collected/{period}', //weekly
        'getUpdatedShows':              '/shows/updates/{start_date}',
        'getShowSummary':               '/shows/{showid}',
        'getShowAliases':               '/shows/{showid}/aliases',
        'getShowTranslations':          '/shows/{showid}/translations/{lang}',
        'getShowComments':              '/shows/{showid}/comments',
        'getShowCollectionProgress':    '/shows/{showid}/progress/collection',
        'getShowWatchedProgress':       '/shows/{showid}/progress/watched',
        'getShowPeople':                '/shows/{showid}/people',
        'getShowRatings':               '/shows/{showid}/ratings',
        'getRelatedShows':              '/shows/{showid}/related',
        'getShowStats':                 '/shows/{showid}/stats',
        'getShowWatching':              '/shows/{showid}/watching',


        
        'getSeasons':                   '/shows/{showid}/seasons',
        'getSeason':                    '/shows/{showid}/seasons/{season}',
        'getSeasonComments':            '/shows/{showid}/seasons/{season}/comments',
        'getSeasonRatings':             '/shows/{showid}/seasons/{season}/ratings',
        'getSeasonStats':               '/shows/{showid}/seasons/{season}/stats',
        'getSeasonWatching':            '/shows/{showid}/seasons/{season}/watching',
        
        
        
        'getEpisodeSummary':            '/shows/{showid}/seasons/{season}/episodes/{episode}',
        'getEpisodeComments':           '/shows/{showid}/seasons/{season}/episodes/{episode}/comments/{sortby}', //sortby: newest, oldest, likes, replies
        'getEpisodeRatings':            '/shows/{showid}/seasons/{season}/episodes/{episode}/ratings',
        'getEpisodeStats':              '/shows/{showid}/seasons/{season}/episodes/{episode}/stats',
        'getEpisodeWatching':           '/shows/{showid}/seasons/{season}/episodes/{episode}/watching',



        'getMyShows': '/calendars/my/shows/{start_date}/{days}',
        'getMyNewShows': '/calendars/my/shows/new/{start_date}/{days}',
        'getMyNewSeasons': '/calendars/my/shows/premieres/{start_date}/{days}',
        'getAllShows': '/calendars/all/shows/{start_date}/{days}',
        'getAllNewShows': '/calendars/all/shows/new/{start_date}/{days}',
        'getAllNewSeasons': '/calendars/all/shows/premieres/{start_date}/{days}',



        'getPopularMovies': '/movies/popular',
        'getTrendingMovies': '/movies/trending',
        'getAnticipatedMovies': '/movies/anticipated',
        'getBoxofficeMovies': '/movies/boxoffice',
        'getMovieSummary': '/movies/{movieid}',
        'getMoviePeople': '/movies/{movieid}/people',
        'getMovieRatings': '/movies/{movieid}/ratings',
        'getRelatedMovies': '/movies/{movieid}/related',
        'getAllMovies': '/calendars/all/movies/{start_date}/{days}',
        'getMovieComments': '/movies/{movieid}/comments',
        'getMovieStats': '/movies/{movieid}/stats',
        'getMovieWatching': '/movies/{movieid}/watching',
        'getMovieWatchedHistory': '/sync/history/movies/{movieid}',



        'getPeopleSummary': '/people/{personid}',
        'getPeopleMovies': '/people/{personid}/movies',
        'getPeopleShows': '/people/{personid}/shows',

        'getSearch': '/search'
    }
    var setHeader = function (xhr) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('trakt-api-key', clientID);
        xhr.setRequestHeader('trakt-api-version', '2');
        xhr.setRequestHeader('Origin', 'ms-appx://375671a2-0073-4ea1-9325-342889186509');
        if (accessToken) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        }
    }

    var getSearch = function (query, type, year) {
        var url = endpoints['getSearch'];
        var type = type || 'movie,show,episode,person';
        var year = year || false;

        url = url + '?query=' + query;
        if (type)
            url = url + '&type=' + type;
        if (year)
            url = url + '&year=' + year;
        url = url + '&limit=20';
        return getInfo(url);
    }
    

    var getPopularMovies = function () {
        var url = endpoints['getPopularMovies'];
        url = url + '?page=1&limit=10';
        return getInfo(url);
    }
    var getTrendingMovies = function () {
        var url = endpoints['getTrendingMovies'];
        url = url + '?page=1&limit=10';
        return getInfo(url);
    }
    var getAnticipatedMovies = function () {
        var url = endpoints['getAnticipatedMovies'];
        url = url + '?page=1&limit=10';
        return getInfo(url);
    }
    var getBoxofficeMovies = function () {
        var url = endpoints['getBoxofficeMovies'];
        return getInfo(url);
    }
    var getMovieSummary = function (movieid) {
        var url = endpoints['getMovieSummary'];
        url = url.replace('{movieid}', movieid);
        url = url + '?extended=full';
        return getInfo(url);
    }
    var getMoviePeople = function (movieid) {
        var url = endpoints['getMoviePeople'];
        url = url.replace('{movieid}', movieid);
        url = url + '?extended=full';
        return getInfo(url);
    }
    var getMovieComments = function (movieid, page, limit) {
        var page = page || 1;
        var limit = limit || 10;
        var url = endpoints['getMovieComments'];
        url = url.replace('{movieid}', movieid);
        url = url + '?extended=images&page=' + page + '&limit=' + limit;
        return getInfo(url);
    }
    var getEpisodeComments = function (showid, season, episode, page, limit) {
        var page = page || 1;
        var limit = limit || 10;
        var url = endpoints['getEpisodeComments'];
        url = url.replace('{season}', season);
        url = url.replace('{episode}', episode);
        url = url.replace('{showid}', showid);
        url = url.replace('{sortby}', 'newest');
        url = url + '?extended=images&page=' + page + '&limit=' + limit;
        return getInfo(url);
    }
    var getRelatedMovies = function (movieid) {
        var url = endpoints['getRelatedMovies'];
        url = url.replace('{movieid}', movieid);
        url = url + '?limit=6';
        return getInfo(url);
    }
    var getMovieStats = function (movieid) {
        var url = endpoints['getMovieStats'];
        url = url.replace('{movieid}', movieid);
        return getInfo(url);
    }
    var getMovieWatching = function (movieid) {
        var url = endpoints['getMovieWatching'];
        url = url.replace('{movieid}', movieid);
        return getInfo(url);
    }
    var getMovieRatings = function (movieid) {
        var url = endpoints['getMovieRatings'];
        url = url.replace('{movieid}', movieid);
        return getInfo(url);
    }
    var getTrendingShows = function () {
        var url = endpoints['getTrendingShows'];
        url = url + '?page=1&limit=10';
        return getInfo(url);
    }
    var getPopularShows = function () {
        var url = endpoints['getPopularShows'];
        url = url + '?page=1&limit=10';
        return getInfo(url);
    }
    var getShowSummary = function (showid) {
        var url = endpoints['getShowSummary'];
        url = url.replace('{showid}', showid);
        url = url + '?extended=full';
        return getInfo(url);
    }
    var getShowSeasons = function (showid) {
        var url = endpoints['getSeasons'];
        url = url.replace('{showid}', showid);
        return getInfo(url);
    }
    var getShowSeasonsSeason = function (showid, season) {
        var url = endpoints['getSeason'];
        url = url.replace('{showid}', showid);
        url = url.replace('{season}', season);
        url = url + '?extended=full';
        return getInfo(url);
    }
    var getShowComments = function (showid, page, limit) {
        var page = page || 1;
        var limit = limit || 10;
        var url = endpoints['getShowComments'];
        url = url.replace('{showid}', showid);
        url = url + '?extended=images&page='+page+'&limit='+limit;
        return getInfo(url);
    }
    var getShowPeople = function (showid) {
        var url = endpoints['getShowPeople'];
        url = url.replace('{showid}', showid);
        url = url + '?extended=full';
        return getInfo(url);
    }
    var getShowRatings = function (showid) {
        var url = endpoints['getShowRatings'];
        url = url.replace('{showid}', showid);
        return getInfo(url);
    }
    var getRelatedShows = function (showid) {
        var url = endpoints['getRelatedShows'];
        url = url.replace('{showid}', showid);
        url = url + '?limit=6';
        return getInfo(url);
    }
    var getShowStats = function (showid) {
        var url = endpoints['getShowStats'];
        url = url.replace('{showid}', showid);
        return getInfo(url);
    }
    var getShowWatching = function (showid) {
        var url = endpoints['getShowWatching'];
        url = url.replace('{showid}', showid);
        return getInfo(url);
    }
    var getShowWatchedProgress = function (showid, traktid) {
        var url = endpoints['getShowWatchedProgress'] + '?hidden=false&specials=false&extended=full&traktid=' + traktid;
        url = url.replace('{showid}', showid);
        return getInfo(url);
    }
    var getMovieWatchedHistory = function (movieid) {
        var url = endpoints['getMovieWatchedHistory'];
        url = url.replace('{movieid}', movieid);
        return getInfo(url);
    }
    var getAnticipatedShows = function () {
        var url = endpoints['getMostAnticipatedShows'];
        url = url + '?page=1&limit=10';
        return getInfo(url);
    }


    /**
    *
    * SEASON ENDPOINTS
    *
    **/
    var getSeasonStats = function (showid, season) {
        var url = endpoints['getSeasonStats'];
        url = url.replace('{showid}', showid);
        url = url.replace('{season}', season);
        return getInfo(url);
    }
    var getSeasonComments = function (showid, season) {
        var url = endpoints['getSeasonComments'];
        url = url.replace('{showid}', showid);
        url = url.replace('{season}', season);
        return getInfo(url);
    }
    var getSeasonWatchers = function (showid, season) {
        var url = endpoints['getSeasonWatchers'];
        url = url.replace('{showid}', showid);
        url = url.replace('{season}', season);
        return getInfo(url);
    }
    var getEpisodeSummary = function (showid, season, episode, extenders) {
        var url = endpoints['getEpisodeSummary'];
        url = url.replace('{showid}', showid);
        url = url.replace('{season}', season);
        url = url.replace('{episode}', episode);
        url = url + '?extended=full,images&traktid=' + showid;
        var extenders = extenders || {};
        return getInfo(url, extenders);
    }
    var getUsersSettings = function () {
        var url = endpoints['getUsersSettings'];
        return getInfo(url);
    }
    var getUsersWatching = function (profilename) {
        var url = endpoints['getUsersWatching'];
        url = url.replace('{profilename}', profilename);
        return getInfo(url);
    }
    var getUsersWatchlist = function (profilename, type='') {
        var url = endpoints['getUsersWatchlist'];
        url = url.replace('{profilename}', profilename);
        url = url.replace('{type}', type);
        url = url + '?extended=images';
        return getInfo(url);
    }
    
    var getMyShows = function (startdate, days) {
        var url = endpoints['getMyShows'];
        url = url.replace('{start_date}', startdate);
        url = url.replace('{days}', days);
        url = url + '?extended=full,images';
        return getInfo(url);
    }

    //PERSON ENDPOINT

    var getPeopleSummary = function (personid) {
        var url = endpoints['getPeopleSummary'];
        url = url.replace('{personid}', personid);
        url = url + '?extended=full,images';
        return getInfo(url);
    }
    var getPeopleMovies = function (personid) {
        var url = endpoints['getPeopleMovies'];
        url = url.replace('{personid}', personid);
        url = url + '?extended=images';
        return getInfo(url);
    }
    var getPeopleShows = function (personid) {
        var url = endpoints['getPeopleShows'];
        url = url.replace('{personid}', personid);
        url = url + '?extended=images';
        return getInfo(url);
    }

    var getUsersWatched = function (profilename, type) {
        var url = endpoints['getUsersWatched'];
        url = url.replace('{profilename}', profilename);
        url = url.replace('{type}', type);
        url = url + '?extended=noseasons,images,full';
        return getInfo(url);
    }


    var doCheckin = function (movie) {
        var url = endpoints['doCheckin'];
        var data = JSON.stringify(movie);
        return postInfo(url, data);
    }
    var addToCollection = function (data) {
        var url = endpoints['addToCollection'];
        data = JSON.stringify(data);
        return postInfo(url, data);
    }
    var addToWatchlist = function (data) {
        var url = endpoints['addToWatchlist'];
        data = JSON.stringify(data);
        return postInfo(url, data);
    }
    var addRating = function (data) {
        var url = endpoints['addRating'];
        data = JSON.stringify(data);
        console.log(data);
        return postInfo(url, data);
    }
    var addToHistory = function (data) {
        var url = endpoints['addToHistory'];
        data = JSON.stringify(data);
        console.log(data);
        return postInfo(url, data);
    }
    var postComment = function (data) {
        var url = endpoints['postComment'];
        data = JSON.stringify(data);
        console.log(data);
        return postInfo(url, data);
    }
    var deleteComment = function (commentid) {
        var url = endpoints['deleteComment'];
        url = url.replace('{id}', commentid);
        return getInfo(url, {},"DELETE");
    }


    var postInfo = function (url, data) {
        if (isTest) console.log(accessToken);
        if (isTest) console.log(url);
        var modUrl = baseURL + url;
        var data = data || {};

        var jqxhr = $.ajax({
            url: modUrl,
            type: 'POST',
            dataType: 'json',
            data: data,
            cache:false,
            contentType: 'application/json',
            beforeSend: setHeader,
            complete: function (resp) {
                if (isTest) console.log(resp.getAllResponseHeaders());
            }
        });
        return jqxhr;
    }
    var getInfo = function (url, data, type) {
        if(isTest) console.log(accessToken);
        if (isTest) console.log(url);
        var modUrl = baseURL + url;
        var data = data || {};
        var type = type || 'GET';

        return $.ajax({
            url: modUrl,
            type: type,
            dataType: 'json',
            data: data,
            cache: false,
            contentType: 'application/json',
            beforeSend: setHeader
        }).done(function (e) {
            if (isTest) console.log(e);

        }).fail(function (e) {
            console.log(e)
        });

       /* if (jqxhr.statusCode == 401) {
            console.log("access token expired");
            return requestRefreshToken(url, data);
        }
        else if (jqxhr.statusCode == 504) {
            console.log("TIME OUT");
            return false;
        }
        else
            return jqxhr;*/
    }
    var requestAuth = function (callback) {
        var callback = callback || {};
        var loginURL = "https://trakt.tv/oauth/authorize?response_type=code&client_id=" + clientID + "&redirect_uri=http://localhost";
        Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(Windows.Security.Authentication.Web.WebAuthenticationOptions.none,
                new Windows.Foundation.Uri(loginURL), new Windows.Foundation.Uri("http://localhost"))
                .then(function success(result) {
                    if (result.responseErrorDetail == 0) {
                        var sPageURL = result.responseData;
                        var sURLVariables = sPageURL.split('?');
                        for (var i = 0; i < sURLVariables.length; i++) {
                            var sParameterName = sURLVariables[i].split('=');
                            if (sParameterName[0] == "code") {
                                var returnedCode = sParameterName[1];

                                var Request = new XMLHttpRequest();
                                Request.open('POST', baseURL+'/oauth/token');
                                Request.setRequestHeader('Content-Type', 'application/json');
                                Request.onreadystatechange = function () {
                                    if (this.readyState === 4) {
                                        if (this.status == 200) {
                                            var res = JSON.parse(this.responseText);
                                            accessToken = res.access_token;
                                            refreshToken = res.refresh_token;
                                            Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] = res.access_token;
                                            Windows.Storage.ApplicationData.current.roamingSettings.values['trk_refreshtoken'] = res.refresh_token;
                                            callback();
                                        }
                                        else {
                                            console.log("ERROR");
                                        }
                                    }
                                };
                                var body = {
                                    'code': returnedCode,
                                    'client_id': clientID,
                                    'client_secret': clientSecret,
                                    'redirect_uri': 'http://localhost',
                                    'grant_type': 'authorization_code'
                                };
                                Request.send(JSON.stringify(body));
                            }
                        }
                    }
                }, function error(error) {
                    console.log(error);
                });
    }
    var requestRefreshToken = function (url, data) {
        var Request = new XMLHttpRequest();
        Request.open('POST', 'https://api.trakt.tv/oauth/token');
        Request.setRequestHeader('Content-Type', 'application/json');
        Request.onreadystatechange = function () {
            if (this.readyState === 4) {
                var res = JSON.parse(this.responseText);
                accessToken = res.access_token;
                refreshToken = res.refresh_token;
                Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] = res.access_token;
                Windows.Storage.ApplicationData.current.roamingSettings.values['trk_refreshtoken'] = res.refresh_token;
                return getInfo(url, data);
            }
        };
        var body = {
            'refresh_token': refreshToken,
            'client_id': clientID,
            'client_secret': clientSecret,
            'redirect_uri': 'http://localhost',
            'grant_type': 'refresh_token'
        };
        Request.send(JSON.stringify(body));
    }
    return {
        getPopularShows: getPopularShows,
        getShowSummary: getShowSummary,
        getShowSeasons: getShowSeasons,
        getTrendingShows: getTrendingShows,
        getShowComments: getShowComments,
        getShowPeople: getShowPeople,
        getShowRatings: getShowRatings,
        getRelatedShows: getRelatedShows,
        getSeasonStats: getSeasonStats,
        getSeasonWatchers: getSeasonWatchers,
        requestAuth: requestAuth,
        getUsersSettings: getUsersSettings,
        getMyShows: getMyShows,
        getTrendingMovies: getTrendingMovies,
        getMovieSummary: getMovieSummary,
        getMoviePeople: getMoviePeople,
        getSearch: getSearch,
        getMovieComments: getMovieComments,
        getRelatedMovies: getRelatedMovies,
        getMovieStats: getMovieStats,
        getMovieWatching: getMovieWatching,
        getMovieRatings: getMovieRatings,
        getShowStats: getShowStats,
        getShowWatching: getShowWatching,
        getPeopleSummary: getPeopleSummary,
        getPeopleMovies: getPeopleMovies,
        getPeopleShows: getPeopleShows,
        doCheckin: doCheckin,
        getUsersWatching: getUsersWatching,
        getShowSeasonsSeason: getShowSeasonsSeason,
        addToCollection: addToCollection,
        addToWatchlist: addToWatchlist,
        addToHistory: addToHistory,
        getShowWatchedProgress:getShowWatchedProgress,
        getMovieWatchedHistory: getMovieWatchedHistory,
        getEpisodeSummary: getEpisodeSummary,
        requestRefreshToken: requestRefreshToken,
        getUsersWatched: getUsersWatched,
        postComment: postComment,
        deleteComment: deleteComment,
        getEpisodeComments: getEpisodeComments,
        addRating: addRating,
        getUsersWatchlist: getUsersWatchlist,
        getPopularMovies: getPopularMovies,
        getAnticipatedMovies: getAnticipatedMovies,
        getBoxofficeMovies: getBoxofficeMovies,
        getAnticipatedShows: getAnticipatedShows
    }
}();