(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    WinJS.UI.Pages.define("/pages/deck.html", {
        ready: function (element, options) {
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            trakt().fanart.hide();
            $("#menubar").addClass("showback");
            $("body").removeClass().addClass("menu-deck");
            WinJS.Resources.processAll();

            $("#show-movie-name").text('On Deck (beta)').addClass("visible");

            if (trakt().login.require()) {
                var towatch_raw = Array();

                var userData = JSON.parse(Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings']);
                traktAPI.getUsersWatched(userData.user.username, "shows").done(function (data, textSTatus, xhr) {


                    var processTimer;
                    var target = document.getElementById("watchlistContent");
                    var orderStatus = false;
                    var observer = new MutationObserver(function (changes, mutationObserver) {
                        changes.forEach(function (mutation) {
                            /*if ($(window).height() <= 768) {
                                $("#watchlistContent").css({ "width": ($("#watchlistContent .item").outerWidth(true) * Math.ceil($("#watchlistContent .item").length / 2)) + 96 });
                            }
                            else {
                                $("#watchlistContent").css({ "width": ($("#watchlistContent .item").outerWidth(true) * Math.ceil($("#watchlistContent .item").length / 3)) + 96 });
                            }*/
                            clearTimeout(processTimer);
                            processTimer = setTimeout(function () {
                                appProgress.hide();
                                if (!orderStatus) {
                                    $("#watchlistContent .item").sort(function (a, b) {
                                        return new Date($(a).data("date")) - new Date($(b).data("date"));
                                    }).appendTo("#watchlistContent");
                                    orderStatus = true;
                                }

                                $.each($("#watchlistContent .item:not(.isvisible) img"), function (index) {
                                    var sender = this;
                                    var params = { "tvdb": sender.dataset.tvdb, "tmdb": sender.dataset.tmdb, "imgid": sender.dataset.imgid, "imgtype": sender.dataset.imgtype, "id": sender.id, "season": sender.dataset.season, "episode": sender.dataset.episode, "index": index };
                                    cacherAPI.get(params).then((res) => {
                                        sender.src = res.screenshot.small;
                                        $(sender).parent().addClass("isvisible");
                               
                                    });
                                });
                                clearTimeout(processTimer);
                            }, 1000);

                        });
                    });
                    observer.observe(target, { childList: true });

                    for (var a = 0; a < data.length; a++) {
                        towatch_raw.push({ "showid": data[a].show.ids.trakt, "showidtvdb": data[a].show.ids.tvdb, "showidtmdb": data[a].show.ids.tmdb, "showtitle": data[a].show.title, "showimage": "" });
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
                            var curDay = 0, curMonth = 0, isFirst = true;

                            for (var key in towatch_raw) {
                                if (parseInt(params.traktid) === parseInt(towatch_raw[key].showid)) {

                                    if (data2.completed < data2.aired) {
                                        for (var c = 0; c < data2.seasons.length; c++) {
                                            if (data2.seasons[c].completed < data2.seasons[c].aired) {
                                                for (var d = 0; d < data2.seasons[c].episodes.length; d++) {
                                                    if (!data2.seasons[c].episodes[d].completed) {

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
                                                            var totalHTML = '';
                                                            for (var key in towatch_raw) {
                                                                if (parseInt(params.traktid) === parseInt(towatch_raw[key].showid)) {
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
                                                                    if (h === 0) {
                                                                        h = 12;
                                                                    }
                                                                    m = m < 10 ? "0" + m : m;

                                                                    var diffDays = Math.abs((secondDate.getTime() - firstDate.getTime()) / (oneDay));
                                                                    var completeDate = dateMonths[d.getMonth()] + " " + d.getDate() + " " + d.getFullYear() + " at " + h + ":" + m + "" + dd;

                                                                    var itemID = "cale-" + towatch_raw[key].showid + "-" + data.season + "-" + data.number;

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

                                                                    $("#watchlistContent").append(tile);

                                                                    /*   $("#watchlistContent").append('<button id="' + itemID + '-item" data-showname="' + towatch_raw[key].showtitle + '" data-showid="' + towatch_raw[key].showid + '" data-season="' + data.season + '"  data-episode="' + data.number + '" class="episode-' + data.ids.trakt + ' episode-tile" data-tmdb="' + towatch_raw[key].showidtmdb + '" data-date="' + data.first_aired + '"><img id="' + itemID + '-img" unselectable="on" data-imgid="episode-screenshotbig-' + data.ids.trakt + '" data-imgtype="screenshotbig" data-tvdb="' + towatch_raw[key].showidtvdb + '" data-tmdb="' + towatch_raw[key].showidtmdb + '" data-season="' + data.season + '"  data-episode="' + data.number + '" /><div class="et-cover"><div class="et-showname">' + towatch_raw[key].showtitle + '</div><div class="et-airdate">' + completeDate + '</div><div class="et-episodename"><div class="et-episode">S' + data.season + ' EP' + data.number + '</div>' + data.title + '</div></div></button>');*/

                                                                }

                                                            }

                                                            $("#watchlistContent .item").off("click").on("click", function () {
                                                                var base = this;
                                                                traktvHandlers.getEpisode(base.dataset.showname, base.dataset.showid, $(base).data("season"), $(base).data("episode"), $(base).data("tmdb"));
                                                            });
                                                        }).fail(function (data) { });

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
            }
        },

        unload: function () {

        },
        getAnimationElements: function () {
            return [this.element.querySelector("section")];
        }
    });


    function linkClickEventHandler(eventInfo) {

        var link = eventInfo.target;
        eventInfo.preventDefault();
        $("#show-movie-name").removeClass("visible");
        $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
        setTimeout(function () {
            WinJS.Navigation.navigate(link.href);
            $("#globalprogress").addClass("visible");
        }, 400);
    }
})();
