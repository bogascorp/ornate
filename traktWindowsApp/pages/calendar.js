(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    var startdate = new Date(), isfetching=false;
    WinJS.UI.Pages.define("/pages/calendar.html", {
        ready: function (element, options) {
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            trakt().fanart.hide();
            $("#menubar").addClass("showback");
            $("body").removeClass().addClass("menu-calendar");
            WinJS.Resources.processAll();
            
            $("#show-movie-name").text('Calendar').addClass("visible");

            getMyShows(startdate);
            appProgress.hide();
            
        },

        unload: function () {

        },
        getAnimationElements: function () {
            return [this.element.querySelector("section")];
        }
    });
    
    function getMyShows(startdate, ismore) {
        isfetching = true;
        var ismore = ismore || false;
        if (trakt().login.require()) {       
            var startdate_string = startdate.getFullYear() + "-" + ((startdate.getMonth() < 9) ? "0" : "") + (startdate.getMonth() + 1) + "-" + ((startdate.getDate() < 10) ? "0" : "") + startdate.getDate();
            if (traktAPI.isTest) console.log(startdate);
            traktAPI.getMyShows(startdate_string, 7).done(function (data, textStatus, xhr) {
                if (data.length > 0) {
                    var curDay = 0, curMonth = 0, isFirst = true;
                    var totalHTML = '';
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
                            var dayName = "Today";
                        }
                        else if ((secondDate.getDate() - firstDate.getDate()) == 1) {
                            if (secondDate.getHours() >= 0 && secondDate.getHours() <= 5 || secondDate.getHours() >= 20 && secondDate.getHours() <= 23) {
                                var completeDate = "Tonight at " + h + ":" + m + "" + dd;
                                var dayName = "Tomorrow";
                            }
                            else {
                                var completeDate = "Tomorrow at " + h + ":" + m + "" + dd;
                                var dayName = "Tomorrow";
                            }
                        }
                        else {
                            var completeDate = dateMonths[d.getMonth()] + " " + d.getDate() + " at " + h + ":" + m + "" + dd;
                            var dayName = dateMonths[d.getMonth()] + " " + d.getDate();
                        }


                        var toAppend = '';
                        if (secondDate >= firstDate) {
                        if (d.getMonth() != curMonth || d.getDate() != curDay) {
                            if(isFirst)
                                toAppend += '<div class="cc-day"><div class="cc-day-title">' + dayName + '</div><div class="cc-episodes episode-tiles">';
                            else
                                toAppend += '</div></div><div class="cc-day"><div class="cc-day-title">' + dayName + '</div><div class="cc-episodes episode-tiles">';
                        }
                        
                        var itemID = "cale-" + data[b].show.ids.trakt + "-" + data[b].episode.season + "-" + data[b].episode.number;

                        toAppend += Ornate.Tiles.Templates.episodeTile({
                            id: itemID,
                            trakt: data[b].show.ids.trakt,
                            show: {
                                trakt: data[b].show.ids.trakt,
                                tvdb:  data[b].show.ids.tvdb,
                                tmdb:  data[b].show.ids.tmdb
                            },
                            season: data[b].episode.season,
                            episode: data[b].episode.number,
                            labelSmall: ((data[b].episode.title != null) ? data[b].episode.title : 'TBA'),
                            showName: data[b].show.title,
                            label: 'S' + data[b].episode.season + 'E' + data[b].episode.number,
                            caption: data[b].show.title,
                            captionSmall: completeDate + ' on ' + data[b].show.network,
                            description: ''
                        });

                            /*toAppend += '<button id="' + itemID + '-item" data-showname="' + data[b].show.title + '" data-showid="' + data[b].show.ids.trakt + '" data-season="' + data[b].episode.season + '"  data-episode="' + data[b].episode.number + '" class="episode-tile"><img id="' + itemID + '-img" unselectable="on" data-imgid="show-fanartsmall-' + data[b].show.ids.trakt + '" data-imgtype="showfanartsmall" data-tvdb="' + data[b].show.ids.tvdb + '" data-tmdb="' + data[b].show.ids.tmdb + '" /><div class="et-cover"><div class="et-showname">' + data[b].show.title + '</div><div class="et-airdate">' + completeDate + ' on ' + data[b].show.network + '</div><div class="et-episodename"><div class="et-episode">S' + data[b].episode.season + ' EP' + data[b].episode.number + '</div>' + ((data[b].episode.title != null) ? data[b].episode.title : 'TBA') + '</div></div></button>';*/

                        }


                        totalHTML += toAppend;
                        curDay = d.getDate();
                        curMonth = d.getMonth();
                        isFirst = false;
                    }
                    $("#cc-loadmore").remove();
                    $("#calendarContent").append(totalHTML + '</div></div><div id="cc-loadmore">next 7 days</div>');

                    isfetching = false;
                    $("#cc-loadmore").off("click").on("click", function () {                     
                        startdate.setDate(startdate.getDate() + 7);
                        startdate.setHours(0, 0, 0, 0);

                        var startdate_string = startdate.getFullYear() + "-" + ((startdate.getMonth() < 9) ? "0" : "") + (startdate.getMonth() + 1) + "-" + ((startdate.getDate() < 10) ? "0" : "") + startdate.getDate();
                        getMyShows(startdate, true);
                    });
                    $("#calendarContent").off("scroll").on("scroll", function (e) {
                        if (document.getElementById("calendarContent").scrollLeft >= (document.getElementById("calendarContent").scrollWidth - (document.getElementById("calendarContent").clientWidth + 800))) {
                            if (!isfetching) {
                                startdate.setDate(startdate.getDate() + 7);
                                startdate.setHours(0, 0, 0, 0);

                                var startdate_string = startdate.getFullYear() + "-" + ((startdate.getMonth() < 9) ? "0" : "") + (startdate.getMonth() + 1) + "-" + ((startdate.getDate() < 10) ? "0" : "") + startdate.getDate();
                                getMyShows(startdate, true);
                            }
                        }

                    });

                    $.each($("#calendarContent img"), function (index) {
                        cacherAPI.preCache(this, index, 1);
                    });


                    setTimeout(function () {
                        $("#calendarContent .item").off("click").on("click", function () {
                            var base = this;
                            traktvHandlers.getEpisode($(base).data("showname"), $(base).data("showid"), $(base).data("season"), $(base).data("episode"), $(base).data("tmdb"));
                        });
                    }, 800);
                }
                appProgress.hide();
            }).fail(function (data) {
                console.log(data);

                traktAPI.requestRefreshToken();

                $(".maincontainer .col1").css({ display: "none" });
            });
        }
    }

    function linkClickEventHandler(eventInfo) {
        var link = eventInfo.target;
        eventInfo.preventDefault();
        $("#show-movie-name").removeClass("visible");
        $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
        setTimeout(function () {
            WinJS.Navigation.navigate(link.href);
            appProgress.show();
        }, 400);
    }
})();
