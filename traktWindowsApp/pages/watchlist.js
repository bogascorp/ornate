(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    WinJS.UI.Pages.define("/pages/watchlist.html", {
        ready: function (element, options) {
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            trakt().fanart.hide();
            $("#menubar").addClass("showback");
            $("body").removeClass().addClass("menu-tvshows");
            WinJS.Resources.processAll();
            $("#show-movie-name").text('Watchlist (preview)').addClass("visible");

            if (trakt().login.require()) {
                var towatch_raw = Array();

                var userData = JSON.parse(Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings']);
                traktAPI.getUsersWatchlist(userData.user.username).done(function (data, textSTatus, xhr) {
                    for (var a = 0; a < data.length; a++) {
                        switch (data[a].type) {
                            case 'show':
                                $("#watchlistContent").append('<button id="wli-' + data[a].show.ids.trakt + '-item" data-type="show" data-showid="' + data[a].show.ids.trakt + '" class="item"><div class="image"><img id="wli-' + data[a].show.ids.trakt + '-img" unselectable="on" data-imgid="show-postersmall-' + data[a].show.ids.trakt + '" data-imgtype="showpostersmall" data-tvdb="' + data[a].show.ids.tvdb + '" data-tmdb="' + data[a].show.ids.tmdb + '" /></div><span class="title">' + data[a].show.title + '</span></button>');
                                break;
                            case 'season':
                                $("#watchlistContent").append('<button id="wli-' + data[a].show.ids.trakt + '-item" data-type="season" data-showid="' + data[a].show.ids.trakt + '" data-season="' + data[a].season.number + '" data-tvdb="' + data[a].show.ids.tvdb + '" data-tmdb="' + data[a].show.ids.tmdb + '" class="item"><div class="image"><img id="wli-' + data[a].show.ids.trakt + '-img" unselectable="on" data-imgid="show-' + data[a].show.ids.trakt + '-seasonpostersmall-' + data[a].season.number + '" data-imgtype="seasonpostersmall" data-tvdb="' + data[a].show.ids.tvdb + '" data-tmdb="' + data[a].show.ids.tmdb + '" /></div><span class="title">Season ' + data[a].season.number + '<br> ' + data[a].show.title + '</span></button>');
                                break;
                            case 'episode':
                                $("#watchlistContent").append('<button id="wli-' + data[a].show.ids.trakt + '-item" data-type="episode" data-showid="' + data[a].show.ids.trakt + '" data-season="' + data[a].episode.season + '" data-episode="' + data[a].episode.number + '" data-tvdb="' + data[a].show.ids.tvdb + '" data-tmdb="' + data[a].show.ids.tmdb + '" class="item"><div class="image"><img id="wli-' + data[a].show.ids.trakt + '-img" unselectable="on" data-imgid="show-postersmall-' + data[a].show.ids.trakt + '" data-imgtype="showpostersmall" data-tvdb="' + data[a].show.ids.tvdb + '" data-tmdb="' + data[a].show.ids.tmdb + '" /></div><span class="title">S' + data[a].episode.season + 'E' + data[a].episode.number + ' ' + data[a].episode.title + '<br>' + data[a].show.title + ')</span></button>');
                                break;
                            case 'movie':
                                var itemID = "trm-" + data[a].movie.ids.trakt;
                                var tile = Ornate.Tiles.Templates.movieTile({
                                    id: itemID,
                                    trakt: data[a].movie.ids.trakt,
                                    tmdb: data[a].movie.ids.tmdb,
                                    title: data[a].movie.title
                                });
                                $("#movies-trending").append(tile); 

                                /*$("#watchlistContent").append('<button id="wli-' + data[a].movie.ids.trakt + '-item" data-type="movie" data-movieid="' + data[a].movie.ids.trakt + '" class="item"><div class="image"><img id="wli-' + data[a].movie.ids.trakt + '-img" unselectable="on" data-imgid="movie-postersmall-' + data[a].movie.ids.trakt + '" data-imgtype="moviepostersmall" data-tvdb="' + data[a].movie.ids.tvdb + '" data-tmdb="' + data[a].movie.ids.tmdb + '" /></div><span class="title">' + data[a].movie.title + '</span></button>');*/
                                break;
                        }

                        
                    }
                    appProgress.hide();

                    $.each($("#watchlistContent img"), function (index) {
                        cacherAPI.preCache(this, index, 1);
                    });

                    $("#watchlistContent .item").off("click").on("click", function () {
                        var sender = this;
                        switch (sender.dataset.type) {
                            case 'show':
                                traktvHandlers.gotoShow(sender.dataset.showid);
                                break;
                            case 'season':
                                var params = { "trakt": $(sender).data("showid"), "tmdb": $(sender).data("tmdb"), "tvdb": $(sender).data("tvdb"), "season": $(sender).data("season") };
                                traktvHandlers.gotoSeason(params);
                                break;
                            case 'episode':
                                traktvHandlers.getEpisode(sender.dataset.showname, sender.dataset.showid, sender.dataset.season, sender.dataset.episode, sender.dataset.tmdb);
                                break;
                            case 'movie':
                                traktvHandlers.gotoMovie(sender.dataset.movieid);
                                break;
                        }
                        
                    });
                   


                }).fail(function (data) { console.log(data); appProgress.hide(); });
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
