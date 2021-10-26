(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    WinJS.UI.Pages.define("/pages/movies.html", {
        ready: function (element, options) {
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            trakt().fanart.hide();
            $("#menubar").addClass("showback");
            $("body").removeClass().addClass("menu-movies");
            WinJS.Resources.processAll();
            
           
            $("#show-movie-name").text('Movies').addClass("visible");

            traktAPI.getTrendingMovies().done(function (data, textSTatus, xhr) {
                if (traktAPI.isTest) console.log("currentpage: " + xhr.getResponseHeader("X-Pagination-Page"));
                if (traktAPI.isTest) console.log("maxpage: " + xhr.getResponseHeader("X-Pagination-Limit"));
                if (traktAPI.isTest) console.log(data);
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "trm-" + trk_episodes[b].movie.ids.trakt;
                    var tile = Ornate.Tiles.Templates.movieTile({
                        id: itemID,
                        trakt: trk_episodes[b].movie.ids.trakt,
                        tmdb: trk_episodes[b].movie.ids.tmdb,
                        title: trk_episodes[b].movie.title
                    });
                    $("#movies-trending").append(tile); 
                }
                $("#movies-trending .item").click(function () {
                    var base = this;
                    traktvHandlers.gotoMovie($(base).data("movieid"));
                });
                $.each($("#movies-trending img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });
                appProgress.hide();
            }).fail(function (data) { console.log(data); });

            traktAPI.getPopularMovies().done(function (data, textSTatus, xhr) {
                if (traktAPI.isTest) console.log("currentpage: " + xhr.getResponseHeader("X-Pagination-Page"));
                if (traktAPI.isTest) console.log("maxpage: " + xhr.getResponseHeader("X-Pagination-Limit"));
                if (traktAPI.isTest) console.log(data);
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "trm-" + trk_episodes[b].ids.trakt;
                    var tile = Ornate.Tiles.Templates.movieTile({
                        id: itemID,
                        trakt: trk_episodes[b].ids.trakt,
                        tmdb: trk_episodes[b].ids.tmdb,
                        title: trk_episodes[b].title
                    });
                    $("#movies-popular").append(tile); 
                }
                $("#movies-popular button").click(function () {
                    var base = this;
                    traktvHandlers.gotoMovie($(base).data("movieid"));
                });
                $.each($("#movies-popular img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });
                appProgress.hide();
            }).fail(function (data) { console.log(data); });

            traktAPI.getAnticipatedMovies().done(function (data, textSTatus, xhr) {
                if (traktAPI.isTest) console.log("currentpage: " + xhr.getResponseHeader("X-Pagination-Page"));
                if (traktAPI.isTest) console.log("maxpage: " + xhr.getResponseHeader("X-Pagination-Limit"));
                if (traktAPI.isTest) console.log(data);
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "trm-" + trk_episodes[b].movie.ids.trakt;

                    var tile = Ornate.Tiles.Templates.movieTile({
                        id: itemID,
                        trakt: trk_episodes[b].movie.ids.trakt,
                        tmdb: trk_episodes[b].movie.ids.tmdb,
                        title: trk_episodes[b].movie.title
                    });
                    $("#movies-anticipated").append(tile); 
                }
                $("#movies-anticipated button").click(function () {
                    var base = this;
                    traktvHandlers.gotoMovie($(base).data("movieid"));
                });
                $.each($("#movies-anticipated img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });
                appProgress.hide();
            }).fail(function (data) { console.log(data); });

            traktAPI.getBoxofficeMovies().done(function (data, textSTatus, xhr) {
                if (traktAPI.isTest) console.log("currentpage: " + xhr.getResponseHeader("X-Pagination-Page"));
                if (traktAPI.isTest) console.log("maxpage: " + xhr.getResponseHeader("X-Pagination-Limit"));
                if (traktAPI.isTest) console.log(data);
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "trm-" + trk_episodes[b].movie.ids.trakt;

                    var tile = Ornate.Tiles.Templates.movieTile({
                        id: itemID,
                        trakt: trk_episodes[b].movie.ids.trakt,
                        tmdb: trk_episodes[b].movie.ids.tmdb,
                        title: trk_episodes[b].movie.title
                    });
                    $("#movies-boxoffice").append(tile); 
                }
                $("#movies-boxoffice button").click(function () {
                    var base = this;
                    traktvHandlers.gotoMovie($(base).data("movieid"));
                });
                $.each($("#movies-boxoffice img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });
                appProgress.hide();
            }).fail(function (data) { console.log(data); });
            
            appProgress.hide();
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
            appProgress.show();
        }, 400);
    }
})();
