(function () {
    "use strict";
    WinJS.Namespace.define("traktHome", { getMyShows: getMyShows });
    WinJS.UI.Pages.define("/pages/home.html", {
        ready: function (element, options) {
            trakt().fanart.hide();
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            WinJS.Resources.processAll();
            $(window).resize(function () {
                if ($(window).height() <= 768) {
                    $(".maincontainer .col1").css({ "width": ($("#upcoming-episodes .item").outerWidth(true) * Math.ceil($("#upcoming-episodes .item").length / 2)) + traktvHandlers.getRem(4) });
                    $(".maincontainer .col0").css({ "width": ($("#unwatched-episodes .item").outerWidth(true) * Math.ceil($("#unwatched-episodes .item").length / 2)) + traktvHandlers.getRem(4) });
                }
                else {
                    $(".maincontainer .col1").css({ "width": ($("#upcoming-episodes .item").outerWidth(true) * Math.ceil($("#upcoming-episodes .item").length / 3)) + traktvHandlers.getRem(4) });
                    $(".maincontainer .col0").css({ "width": ($("#unwatched-episodes .item").outerWidth(true) * Math.ceil($("#unwatched-episodes .item").length / 3)) + traktvHandlers.getRem(4) });
                }
            });
            $("body").removeClass().addClass("menu-home");
            $("#menubar").removeClass("showback");

            //GET TRENDING SHOWS
            traktAPI.getTrendingShows().done(function (data, textSTatus, xhr) {
                if (traktAPI.isTest) console.log(data);
                if (traktAPI.isTest) console.log("currentpage: " + xhr.getResponseHeader("X-Pagination-Page"));
                if (traktAPI.isTest) console.log("maxpage: " + xhr.getResponseHeader("X-Pagination-Limit"));
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "pos-" + trk_episodes[b].show.ids.trakt;
                    $("#popular-shows").append(`<button id="${itemID} item" data-showid="${trk_episodes[b].show.ids.trakt}" class="item"><div class="image"><div class="placeholder"></div><img id="${itemID}-img" unselectable="on" data-imgid="show-postersmall-${trk_episodes[b].show.ids.trakt}" data-imgtype="showpostersmall" data-tvdb="${trk_episodes[b].show.ids.tvdb}" data-tmdb="${trk_episodes[b].show.ids.tmdb}"  /></div><span>${trk_episodes[b].show.title}</span></button>`);
                }

                $("#popular-shows button").click(function () {
                    var base = this;
                    traktvHandlers.gotoShow($(base).data("showid"));
                });

                $.each($("#popular-shows .item:not(.isvisible) img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });
                appProgress.hide();
            }).fail(function (data) { console.log(data); });

            //GET TRENDING MOVIES
            traktAPI.getTrendingMovies().done(function (data, textSTatus, xhr) {
                if (traktAPI.isTest) console.log("currentpage: " + xhr.getResponseHeader("X-Pagination-Page"));
                if (traktAPI.isTest) console.log("maxpage: " + xhr.getResponseHeader("X-Pagination-Limit"));
                if (traktAPI.isTest) console.log(data);
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "trm-" + trk_episodes[b].movie.ids.trakt;
                    $("#trending-movies").append('<button id="' + itemID + '-item" data-movieid="' + trk_episodes[b].movie.ids.trakt + '" class="item"><div class="image"><div class="placeholder"></div><img id="' + itemID + '-img" unselectable="on" data-imgid="movie-postersmall-' + trk_episodes[b].movie.ids.trakt + '" data-imgtype="moviepostersmall" data-tmdb="' + trk_episodes[b].movie.ids.tmdb + '" /></div><span>' + trk_episodes[b].movie.title + '</span></button>');

                }

                $("#trending-movies button").click(function () {
                    var base = this;
                    traktvHandlers.gotoMovie($(base).data("movieid"));
                });

                $.each($("#trending-movies  .item:not(.isvisible) img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });

                appProgress.hide();
            }).fail(function (data) { console.log(data); });

            getMyShows();
            getUnwatched();

            
        },
        unload: function () {

        },
        getAnimationElements: function () {
            return [this.element.querySelector("section")];
        }
    });
    function linkClickEventHandler(eventInfo) {

        var link = eventInfo.target;
        var uri = new Windows.Foundation.Uri(link.href);
        if (uri.host != "media" && uri.host != "user") {
            eventInfo.preventDefault();
            $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });

            cacherAPI.clearQueue();

            setTimeout(function () {
                WinJS.Navigation.navigate(link.href);
                appProgress.show();
            }, 400);
        }
    }
    function getUnwatched() {
        if (trakt().login.require()) {
            var towatch_raw = Array();

            var u = JSON.parse(Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings']);

            traktAPI.getUsersWatched(u.user.username, "shows").done(function (data, textSTatus, xhr) {

                $("#unwatched-episodes").empty();
                var target = document.getElementById("unwatched-episodes");
                var observer = new MutationObserver(function (changes, mutationObserver) {
                    changes.forEach(function (mutation) {
                        if ($(window).height() <= 768) {
                            $(".maincontainer .col0").css({ "width": ($("#unwatched-episodes .item").outerWidth(true) * Math.ceil($("#unwatched-episodes .item").length / 2)) + traktvHandlers.getRem(4) });
                        }
                        else {
                            $(".maincontainer .col0").css({ "width": ($("#unwatched-episodes .item").outerWidth(true) * Math.ceil($("#unwatched-episodes .item").length / 3)) + traktvHandlers.getRem(4) });
                        }
                    });
                });
                observer.observe(target, { childList: true });
                for (var a = 0; a < data.length; a++) {

                    towatch_raw.push({ "showid": data[a].show.ids.trakt, "showidtvdb": data[a].show.ids.tvdb, "showidtmdb": data[a].show.ids.tmdb, "showtitle": data[a].show.title, "showimage": "" }); //trakt().cache.getCachedImage(data[a].show.images.fanart.thumb)
                    traktAPI.getShowWatchedProgress(data[a].show.ids.slug, data[a].show.ids.trakt).done(function (data2, textSTatus2, xhr2) {
                        var parser = document.createElement('a');
                        parser.href = this.url;
                        var queryString = parser.search;
                        queryString = queryString.substring(1);
                        var params = {}, queries, temp, i, l;

                        // Split into key/value pairs
                        queries = queryString.split("&");

                        // Convert the array of strings into an object
                        for (i = 0, l = queries.length; i < l; i++) {
                            temp = queries[i].split('=');
                            params[temp[0]] = temp[1];
                        }


                        for (var key in towatch_raw) {
                            if (params.traktid == towatch_raw[key].showid) {
                                if (data2.completed < data2.aired) {
                                    var isFirst = true;
                                    for (var c = 0; c < data2.seasons.length; c++) {
                                        if (data2.seasons[c].completed < data2.seasons[c].aired) {

                                            for (var d = 0; d < data2.seasons[c].episodes.length; d++) {
                                                if (!data2.seasons[c].episodes[d].completed) {

                                                    if (isFirst) {
                                                        towatch_raw[key].episode = data2.seasons[c].episodes[d].number;
                                                        towatch_raw[key].season = data2.seasons[c].number;

                                                        traktAPI.getEpisodeSummary(towatch_raw[key].showid, data2.seasons[c].number, data2.seasons[c].episodes[d].number, false).done(function (data, textStatus, xhr) {

                                                            var parser = document.createElement('a');
                                                            parser.href = this.url;
                                                            var queryString = parser.search;
                                                            queryString = queryString.substring(1);
                                                            var params = {}, queries, temp, i, l;

                                                            // Split into key/value pairs
                                                            queries = queryString.split("&");

                                                            // Convert the array of strings into an object
                                                            for (i = 0, l = queries.length; i < l; i++) {
                                                                temp = queries[i].split('=');
                                                                params[temp[0]] = temp[1];
                                                            }

                                                            for (var key in towatch_raw) {
                                                                if (params.traktid == towatch_raw[key].showid) {
                                                                    var d = new Date(data.first_aired);
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
                                                                    if (h == 0) {
                                                                        h = 12;
                                                                    }
                                                                    m = m < 10 ? "0" + m : m;
                                                                    var diffDays = Math.ceil(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                                                                    if (diffDays == 0) { //TODAY
                                                                        var completeDate = "Today at " + h + ":" + m + "" + dd;
                                                                    }
                                                                    else if (diffDays == 1) {
                                                                        var completeDate = "Tomorrow at " + h + ":" + m + "" + dd;
                                                                    }
                                                                    else if (diffDays < 7) {
                                                                        var completeDate = dateMonths[d.getMonth()] + " " + d.getDate() + " at " + h + ":" + m + "" + dd;
                                                                    }
                                                                    else var completeDate = dateMonths[d.getMonth()] + " " + d.getDate() + " at " + h + ":" + m + "" + dd;
                                                                    var itemID = "une-" + towatch_raw[key].showid + "-" + data.season + "-" + data.number;
                                                                    var tile = Ornate.Tiles.Templates.episodeTile({
                                                                        id: itemID,
                                                                        trakt: data.ids.trakt,
                                                                        show: {
                                                                            trakt: towatch_raw[key].showid,
                                                                            tvdb: towatch_raw[key].showidtvdb,
                                                                            tmdb: towatch_raw[key].showidtmdb
                                                                        },
                                                                        season: data.season,
                                                                        episode: data.number,
                                                                        labelSmall: data.title,
                                                                        showName: towatch_raw[key].showtitle,
                                                                        label: 'S' + data.season + 'E' + data.number,
                                                                        caption: towatch_raw[key].showtitle,
                                                                        captionSmall: '',
                                                                        description: ''
                                                                    });

                                                                    $("#unwatched-episodes").append(tile);

                                                                    $(".maincontainer .col0").css({ display: "inline-block", marginRight: 0, opacity: 1 });
                                                                    //$(".maincontainer .col0").css({ width: ($(".maincontainer .col0")[0].scrollWidth + 24) });


                                                                    $("#unwatched-episodes .item").off("click").on("click", function () {
                                                                        var base = this;
                                                                        traktvHandlers.getEpisode($(base).data("showname"), $(base).data("showid"), $(base).data("season"), $(base).data("episode"), $(base).data("tmdb"));
                                                                    });

                                                                    break;
                                                                }
                                                            }

                                                            $.each($("#unwatched-episodes .item img"), function (index) {
                                                                cacherAPI.preCache(this, index, 1);
                                                            });


                                                        }).fail(function (data) { });


                                                        isFirst = false;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }).fail(function (data2) { console.log(data2); });
                }
            }).fail(function (data) { console.log(data); });
            setTimeout(function () { trakt().notifications.init(); }, 1000);
        }
    }
    function getMyShows() {
        if (traktAPI.isTest) console.log("dominio: " + document.URL);
        if (Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] && Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] != "") {
            var startdate = new Date();
            startdate = startdate.getFullYear() + "-" + ((startdate.getMonth() < 9) ? "0" : "") + (startdate.getMonth() + 1) + "-" + ((startdate.getDate() < 10) ? "0" : "") + startdate.getDate();
            if (traktAPI.isTest) console.log(startdate);
            traktAPI.getMyShows(startdate, (Windows.Storage.ApplicationData.current.roamingSettings.values['trk_myshows_days']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['trk_myshows_days'] : 7).done(function (data, textStatus, xhr) {
                if (data.length > 0) {

                    for (var b = 0; b < data.length; b++) {
                        var d = new Date(data[b].first_aired);
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
                        if (h == 0) {
                            h = 12;
                        }
                        m = m < 10 ? "0" + m : m;

                        var diffDays = Math.abs((secondDate.getTime() - firstDate.getTime()) / (oneDay));
                        if ((secondDate.getDate() - firstDate.getDate()) == 0) { //TODAY
                            var completeDate = "Today at " + h + ":" + m + "" + dd;
                        }
                        else if ((secondDate.getDate() - firstDate.getDate()) == 1) {
                            if (secondDate.getHours() >= 0 && secondDate.getHours() <= 5 || secondDate.getHours() >= 20 && secondDate.getHours() <= 23)
                                var completeDate = "Tonight at " + h + ":" + m + "" + dd;
                            else
                                var completeDate = "Tomorrow at " + h + ":" + m + "" + dd;
                        }
                        else var completeDate = dateMonths[d.getMonth()] + " " + d.getDate() + " at " + h + ":" + m + "" + dd;

                        if (secondDate >= firstDate) {
                            var itemID = "upe-" + data[b].show.ids.trakt + "-" + data[b].episode.season + "-" + data[b].episode.number;
                            var tile = Ornate.Tiles.Templates.episodeTile({
                                id: itemID,
                                trakt: data[b].episode.ids.trakt,
                                show: {
                                    trakt: data[b].show.ids.trakt,
                                    tvdb: data[b].show.ids.tvdb,
                                    tmdb: data[b].show.ids.tmdb
                                },
                                season: data[b].episode.season,
                                episode: data[b].episode.number,
                                showName: data[b].show.title,
                                labelSmall: data[b].episode.title,
                                label: 'S' + data[b].episode.season + 'E' + data[b].episode.number,
                                caption: data[b].show.title,
                                captionSmall: completeDate + ' on ' + data[b].show.network,
                                description: ''
                            });
                            $("#upcoming-episodes").append(tile);
                        }
                    }
                    if ($("#upcoming-episodes .item").length > 0) {
                        $(".maincontainer .col1").css({ display: "inline-block", marginRight: 0, opacity: 1 });
                        $(".maincontainer .col1").css({ width: ($(".maincontainer .col1")[0].scrollWidth + 24) });
                    }

                    $.each($("#upcoming-episodes img"), function (index) {
                        cacherAPI.preCache(this, index, 1);
                    });

                    setTimeout(function () {
                        $("#upcoming-episodes .item").off("click").on("click", function () {
                            var base = this;
                            traktvHandlers.getEpisode($(base).data("showname"), $(base).data("showid"), $(base).data("season"), $(base).data("episode"), $(base).data("tmdb"));
                        });
                    }, 800);
                } else {
                    $(".maincontainer .col1").css({ display: "none", opacity: 0 });
                }
                appProgress.hide();
            }).fail(function (data) {
                traktAPI.requestRefreshToken();
                $(".maincontainer .col1").css({ display: "none" });
            });
        }
    }
})();
