
    var tmdbAPI = function () {
        var isTest = false;
        var apiKey = "";
        var baseURL = "https://api.themoviedb.org/3";
        var imageSizes = { "fanartBig": "original", "fanartSmall": "w780", "posterBig": "original", "posterSmall": "w500", "profileBig": "original", "profileSmall": "h632" };
        var imageBase = (Windows.Storage.ApplicationData.current.roamingSettings.values["tmdb_imguri"]) ? Windows.Storage.ApplicationData.current.roamingSettings.values["tmdb_imguri"] : false;


        var endpoints = {
            'getShowImages': '/tv/{tv_id}'
        };
        var getShowImages = function (params) {
            var url = endpoints['getShowImages'];
            url = url.replace("{tv_id}", params.tmdb);
            return getInfo(url).then(function (result) {
                if (result.backdrop_path !== "") {
                    return { "image": Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri'] + "w780" + result.backdrop_path, "id": params.id };
                }
                else { return false; }
            });
        };

        var getInfo = function (url) {
            return new Promise(function (resolve, reject) {
                var modUrl = baseURL + url + '?api_key=' + apiKey + '&language=en&v=' + Date.now();
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
        };

        return {
            getShowImages: getShowImages
        }
    }();


    var notifications = Windows.UI.Notifications;
    var clientID = '';
    var accessToken = (Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] : false;


    /*
    * CLEAR TILE INFO
    */
    notifications.TileUpdateManager.createTileUpdaterForApplication().clear();
    notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(true);
    notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().clear();
    var scheduled = Windows.UI.Notifications.ToastNotificationManager.createToastNotifier().getScheduledToastNotifications();
    for (var i = 0; i < scheduled.length; i++) {
        Windows.UI.Notifications.ToastNotificationManager.createToastNotifier().removeFromSchedule(scheduled[i]);
    }


    if (Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] && Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] !== "") {
        var userSettings = JSON.parse(Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings']);


        var userTile_xml = '<tile>' +
            '<visual branding="name">' +
            '<binding template="TileLarge" hint-textStacking="center">' +
            '<group>' +
            '<subgroup hint-weight="1"/>' +
            '<subgroup hint-weight="2">' +
            '<image src="' + userSettings.user.images.avatar.full + '" hint-crop="circle"/>' +
            '</subgroup>' +
            '<subgroup hint-weight="1"/>' +
            '</group>' +
            '<text hint-style="title" hint-align="center">Hi,</text>' +
            '<text hint-style="subtitleSubtle" hint-align="center">' + userSettings.user.username + '</text>' +
            '</binding>' +
            '</visual>' +
            '</tile>';
        var userTile_dom = Windows.Data.Xml.Dom.XmlDocument();
        userTile_dom.loadXml(userTile_xml);
        var userTile_notification = new notifications.TileNotification(userTile_dom);
        notifications.TileUpdateManager.createTileUpdaterForApplication().update(userTile_notification);


        /**
            * GET UNREAD COUNT
            */
        var towatch_raw = Array();
        var totalToWatch = 0;


        var xmlhttp2 = new XMLHttpRequest();
        xmlhttp2.onreadystatechange = function () {
            if (xmlhttp2.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp2.status === 200) {

                    var data = JSON.parse(xmlhttp2.responseText);

                    var requestTree;
                    for (var a = 0; a < data.length; a++) {
                        towatch_raw.push({ "showid": data[a].show.ids.trakt });

                        var xmlhttp3 = new XMLHttpRequest();
                        xmlhttp3.onreadystatechange = function () {

                            if (this.readyState === XMLHttpRequest.DONE) {
                                if (this.status === 200) {
                                    var data2 = JSON.parse(this.responseText);

                                    var queryString = this.responseURL;

                                    var params, queries, temp, i, l;
                                    queries = queryString.split("&");

                                    temp = queries[queries.length - 2].split('=');
                                    params = temp[1];



                                    for (var key in towatch_raw) {
                                        //console.log(params, towatch_raw[key].showid);
                                        if (params == towatch_raw[key].showid) {
                                            if (data2.completed < data2.aired) {
                                                for (var c = 0; c < data2.seasons.length; c++) {

                                                    totalToWatch += (data2.seasons[c].aired - data2.seasons[c].completed);
                                                    // console.log(totalToWatch);

                                                    var badgeType = notifications.BadgeTemplateType.badgeNumber;
                                                    var badgeXml = notifications.BadgeUpdateManager.getTemplateContent(badgeType);
                                                    var badgeAttributes = badgeXml.getElementsByTagName("badge");
                                                    badgeAttributes[0].setAttribute("value", totalToWatch);
                                                    var badgeNotification = new notifications.BadgeNotification(badgeXml);
                                                    notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badgeNotification);
                                                }
                                            }
                                        }
                                    }

                                }
                            }

                        };

                        var urltoget3 = "https://api.trakt.tv/shows/" + data[a].show.ids.slug + "/progress/watched?hidden=false&specials=false&traktid=" + data[a].show.ids.trakt + '&v=' + Date.now();
                        xmlhttp3.open("GET", urltoget3);
                        xmlhttp3.setRequestHeader('Content-Type', 'application/json');
                        xmlhttp3.setRequestHeader('trakt-api-key', clientID);
                        xmlhttp3.setRequestHeader('trakt-api-version', '2');
                        xmlhttp3.setRequestHeader('Origin', 'ms-appx://375671a2-0073-4ea1-9325-342889186509');
                        if (accessToken) {
                            xmlhttp3.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                        }
                        xmlhttp3.send(null);
                    }


                }
            }

        };
        var urltoget2 = "https://api.trakt.tv/users/" + userSettings.user.username + "/watched/shows?extended=noseasons&v=" + Date.now();
        xmlhttp2.open("GET", urltoget2);
        xmlhttp2.setRequestHeader('Content-Type', 'application/json');
        xmlhttp2.setRequestHeader('trakt-api-key', clientID);
        xmlhttp2.setRequestHeader('trakt-api-version', '2');
        xmlhttp2.setRequestHeader('Origin', 'ms-appx://375671a2-0073-4ea1-9325-342889186509');
        if (accessToken) {
            xmlhttp2.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        }
        xmlhttp2.send(null);


        /**
            * GET UPCOMING SHOWS AND TOASTS
            */

        var upcomingData;

        var startdate = new Date();
        startdate = startdate.getFullYear() + "-" + ((startdate.getMonth() < 9) ? "0" : "") + (startdate.getMonth() + 1) + "-" + ((startdate.getDate() < 10) ? "0" : "") + startdate.getDate();
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onerror = function () {
            console.log("ups");
        };
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp.status === 200) {
                    upcomingData = JSON.parse(xmlhttp.responseText);

                    if (upcomingData.length > 0) {
                        var tilesAdded = 0;
                        for (var b = 0; b < upcomingData.length; b++) {





                            tmdbAPI.getShowImages({ "tmdb": upcomingData[b].show.ids.tmdb, "id": b }).then(function (res) {
                                console.log(res);
                                var data = upcomingData;
                                var a = res.id;

                                var newurl = res.image;

                                if (tilesAdded < 4) {

                                    var d = new Date(data[a].first_aired);
                                    var dateMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Novembrer", "December"];
                                    var oneDay = 24 * 60 * 60 * 1000;
                                    var firstDate = new Date();

                                    var secondDate = d;
                                    var hh = d.getHours();
                                    var m = d.getMinutes();
                                    var dd = "AM";
                                    var h = hh;
                                    if (h >= 12) {
                                        h = hh - 12;
                                        dd = "PM";
                                    }
                                    if (h === 0) {
                                        h = 12;
                                    }
                                    m = m < 10 ? "0" + m : m;
                                    var diffDays = Math.abs((secondDate.getTime() - firstDate.getTime()) / (oneDay));
                                    var completeDate;
                                    if ((secondDate.getDate() - firstDate.getDate()) === 0) { //TODAY
                                        completeDate = "Today at " + h + ":" + m + "" + dd;
                                    }
                                    else if ((secondDate.getDate() - firstDate.getDate()) === 1) {
                                        if (secondDate.getHours() >= 0 && secondDate.getHours() <= 5 || secondDate.getHours() >= 20 && secondDate.getHours() <= 23)
                                            completeDate = "Tonight at " + h + ":" + m + "" + dd;
                                        else
                                            completeDate = "Tomorrow at " + h + ":" + m + "" + dd;
                                    }
                                    else completeDate = dateMonths[d.getMonth()] + " " + d.getDate() + " at " + h + ":" + m + "" + dd;
                                    if (secondDate >= firstDate) {
                                        var showTile_xml = '<tile>' +
                                            '<visual>' +
                                            '<binding template="TileWide" displayName="' + data[a].episode.title + '"  branding="name" >' +
                                            '<image src="' + newurl + '" placement="background" hint-overlay="50" />' +
                                            '<group>' +
                                            '<subgroup>' +
                                            '<text hint-style="caption" hint-wrap="false">' + data[a].show.title + '</text>' +
                                            '<text hint-style="captionSubtle" hint-wrap="true">' + completeDate + ' on ' + data[a].show.network + '</text>' +
                                            '<text />' +
                                            '<text hint-style="captionSubtle">Season ' + data[a].episode.season + ' Episode ' + data[a].episode.number + '</text>' +
                                            '</subgroup>' +
                                            '</group>' +
                                            '</binding>' +
                                            '<binding template="TileLarge"  branding="none">' +
                                            '<image src="' + newurl + '" placement="background" hint-overlay="50"/>' +
                                            '<group>' +
                                            '<subgroup>' +
                                            '<text hint-style="base" hint-wrap="true">' + data[a].show.title + '</text>' +
                                            '<text hint-style="baseSubtle" hint-wrap="true">' + completeDate + ' on ' + data[a].show.network + '</text>' +
                                            '</subgroup>' +
                                            '</group>' +
                                            '<text />' +
                                            '<text hint-style="captionSubtle">Season ' + data[a].episode.season + ' Episode ' + data[a].episode.number + '</text>' +
                                            '<text hint-style="captionSubtle" hint-wrap="true">' + ((data[a].episode.title != null) ? data[a].episode.title : '') + '</text>' +
                                            '</binding>' +
                                            '</visual>' +
                                            '</tile>';
                                        var showTile_dom = Windows.Data.Xml.Dom.XmlDocument();
                                        showTile_dom.loadXml(showTile_xml);
                                        console.log(tilesAdded);
                                        var showTile_notification = new notifications.TileNotification(showTile_dom);
                                        notifications.TileUpdateManager.createTileUpdaterForApplication().update(showTile_notification);

                                        tilesAdded++;
                                    }
                                }

                                var airTime = new Date(data[a].first_aired);
                                var curTime = new Date();
                                if (airTime > curTime) {
                                    var idNumber = Math.floor(Math.random() * 100000000);

                                    var toastTemplate = '<toast activationType="protocol" launch="trakt://gotoShow?showid=92187" scenario="reminder">' +
                                        '<visual>' +
                                        '<binding template="ToastGeneric">' +
                                        '<image placement="hero" src="' + newurl + '"/>' +
                                        '<text>' + data[a].show.title + ' is now starting on ' + data[a].show.network + '</text>' +
                                        '<text>' + data[a].episode.title + '</text>' +

                                        '</binding>' +
                                        '</visual>' +
                                        '<actions>' +
                                        '<action content="Check in" activationType="protocol" arguments="trakt://doCheckIn?traktid=92187"/>' +
                                        '<action content="I\'ll watch later" activationType="system" arguments="dismiss"/>' +
                                        '</actions>' +
                                        '<audio src="ms-winsoundevent:Notification.Reminder"/>' +
                                        '</toast>';
                                    console.log(toastTemplate);
                                    var toastDOM = Windows.Data.Xml.Dom.XmlDocument();
                                    toastDOM.loadXml(toastTemplate);
                                    var toast = new Windows.UI.Notifications.ScheduledToastNotification(toastDOM, airTime);
                                    toast.id = "Toast" + idNumber;
                                    Windows.UI.Notifications.ToastNotificationManager.createToastNotifier().addToSchedule(toast);
                                }


                            });


                            //END
                        }


                    }

                }
            }
        };
        var urltoget = "https://api.trakt.tv/calendars/my/shows/" + startdate + "/" + ((Windows.Storage.ApplicationData.current.roamingSettings.values['trk_myshows_days']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['trk_myshows_days'] : 14) + "?extended=full,images&v=" + Date.now();

        console.log(urltoget);
        xmlhttp.open("GET", urltoget);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.setRequestHeader('trakt-api-key', clientID);
        xmlhttp.setRequestHeader('trakt-api-version', '2');
        xmlhttp.setRequestHeader('Origin', 'ms-appx://375671a2-0073-4ea1-9325-342889186509');
        if (accessToken) {
            xmlhttp.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        }
        xmlhttp.send(null);
    }

    setTimeout(function () {
        close();
    }, 20000);
