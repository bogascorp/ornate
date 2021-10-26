(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    WinJS.UI.Pages.define("/pages/tvshows.html", {
        ready: function (element, options) {
            // TODO: Initialize the page here.
            $("section a").off("click").on("click", linkClickEventHandler);
            $("header a").off("click").on("click", linkClickEventHandler);
            trakt().fanart.hide();
            $("#menubar").addClass("showback");
            $("body").removeClass().addClass("menu-tvshows");
            $("#show-movie-name").text('TV Shows').addClass("visible");
            WinJS.Resources.processAll();

            traktAPI.getTrendingShows().done(function (data, textSTatus, xhr) {
                if (traktAPI.isTest) console.log("currentpage: " + xhr.getResponseHeader("X-Pagination-Page"));
                if (traktAPI.isTest) console.log("maxpage: " + xhr.getResponseHeader("X-Pagination-Limit"));
                if (traktAPI.isTest) console.log(data);
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "trs-" + trk_episodes[b].show.ids.trakt;
                    var tile = Ornate.Tiles.Templates.showTile({
                        id: itemID,
                        trakt: trk_episodes[b].show.ids.trakt,
                        tmdb: trk_episodes[b].show.ids.tmdb,
                        title: trk_episodes[b].show.title
                    });
                    $("#shows-trending").append(tile);
                }
                $("#shows-trending .item").click(function () {
                    var base = this;
                    traktvHandlers.gotoShow($(base).data("showid"));
                });
                $.each($("#shows-trending img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });
                appProgress.hide();
            }).fail(function (data) { console.log(data); });

            traktAPI.getPopularShows().done(function (data, textSTatus, xhr) {
                if (traktAPI.isTest) console.log("currentpage: " + xhr.getResponseHeader("X-Pagination-Page"));
                if (traktAPI.isTest) console.log("maxpage: " + xhr.getResponseHeader("X-Pagination-Limit"));
                if (traktAPI.isTest) console.log(data);
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "pps-" + trk_episodes[b].ids.trakt;
                    var tile = Ornate.Tiles.Templates.showTile({
                        id: itemID,
                        trakt: trk_episodes[b].ids.trakt,
                        tmdb: trk_episodes[b].ids.tmdb,
                        title: trk_episodes[b].title
                    });
                    $("#shows-popular").append(tile);
                }
                $("#shows-popular .item").click(function () {
                    var base = this;
                    traktvHandlers.gotoMovie($(base).data("showid"));
                });
                $.each($("#shows-popular img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });
                appProgress.hide();
            }).fail(function (data) { console.log(data); });

            traktAPI.getAnticipatedShows().done(function (data, textSTatus, xhr) {
                if (traktAPI.isTest) console.log("currentpage: " + xhr.getResponseHeader("X-Pagination-Page"));
                if (traktAPI.isTest) console.log("maxpage: " + xhr.getResponseHeader("X-Pagination-Limit"));
                if (traktAPI.isTest) console.log(data);
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "trm-" + trk_episodes[b].show.ids.trakt;

                    var tile = Ornate.Tiles.Templates.showTile({
                        id: itemID,
                        trakt: trk_episodes[b].show.ids.trakt,
                        tmdb: trk_episodes[b].show.ids.tmdb,
                        title: trk_episodes[b].show.title
                    });
                    $("#shows-anticipated").append(tile);
                }
                $("#shows-anticipated .item").click(function () {
                    var base = this;
                    traktvHandlers.gotoMovie($(base).data("showid"));
                });
                $.each($("#shows-anticipated img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });
                appProgress.hide();
            }).fail(function (data) { console.log(data); });
        },

        unload: function () {
            trakt().coverFlow.hide();
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
