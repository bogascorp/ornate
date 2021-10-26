(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    WinJS.UI.Pages.define("/pages/search.html", {
        ready: function (element, options) {
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            trakt().fanart.hide();
            $("#menubar").addClass("showback");
            $("body").removeClass().addClass("menu-search");
            WinJS.Resources.processAll();

            $("#show-movie-name").text('Search (preview)').addClass("visible");
            
            $("#search-button").click(function () {
                if ($("#search-query").val().length > 3)
                    getResults();
            });
            $("#search-query").on("keyup", function (e) {
                if (e.keyCode == 13) {
                    if ($("#search-query").val().length>3)
                        getResults();
                }
            });

            $("#search-query").focus();
            appProgress.hide();
            
        },

        unload: function () {

        },
        getAnimationElements: function () {
            return [this.element.querySelector("section")];
        }
    });

    function getResults() {
        $("#search-results-shows").empty();
        $("#search-results-movies").empty();
        $("#search-results-episodes").empty();
        $("#search-results-people").empty();

        $("#search-results-container > div").removeClass("visible").css({width:'auto'});

        var hasShows = false, hasMovies = false, hasEpisodes = false, hasPeople = false;

        traktAPI.getSearch($("#search-query").val(), $("#search-type").val()).done(function (data) {

            console.log(data);
            $("#debug").html(JSON.stringify(data));


            for (var b = 0; b < data.length; b++) {
                switch (data[b].type) {
                    case "show":
                        if (!hasShows) { $("#search-results-shows").addClass("visible"); hasShows = true; }
                        var itemID = "sres-" + data[b].show.ids.trakt;
                        $("#search-results-shows").append('<button data-showid="' + data[b].show.ids.trakt + '" class="search-results-item"><div class="search-results-image"><img id="' + itemID + '" unselectable="on" data-imgid="show-postersmall-' + data[b].show.ids.trakt + '" data-imgtype="showpostersmall" data-tvdb="' + data[b].show.ids.tvdb + '" data-tmdb="' + data[b].show.ids.tmdb + '" /></div><span>' + data[b].show.title + '</span></button>');
                        break;
                    case "movie":
                        if (!hasMovies) { $("#search-results-shows").addClass("visible"); hasMovies = true; }
                        var itemID = "sres-" + data[b].movie.ids.trakt;
                        $("#search-results-movies").append('<button data-movieid="' + data[b].movie.ids.trakt + '" class="search-results-item"><div class="search-results-image"><img id="' + itemID + '" unselectable="on" data-imgid="movie-postersmall-' + data[b].movie.ids.trakt + '" data-imgtype="moviepostersmall" data-tmdb="' + data[b].movie.ids.tmdb + '" /></div><span>' + data[b].movie.title + '</span></button>');
                        break;
                    case "episode":
                        if (!hasEpisodes) { $("#search-results-shows").addClass("visible"); hasEpisodes = true; }
                        console.log(data[b]);
                        var itemID = "sres-" + data[b].show.ids.trakt;
                        $("#search-results-episodes").append('<button data-showname="' + data[b].show.title + '" data-showid="' + data[b].show.ids.trakt + '" data-season="' + data[b].episode.season + '"  data-episode="' + data[b].episode.number + '" class="search-results-item"><img id="' + itemID + '" unselectable="on" data-imgid="episode-screenshotsmall-' + data[b].show.ids.trakt + '" data-imgtype="screenshotsmall" data-tvdb="' + data[b].show.ids.tvdb + '" data-tmdb="' + data[b].show.ids.tmdb + '" data-season="' + data[b].episode.season + '"  data-episode="' + data[b].episode.number + '"" /><div class="sre-cover"><div class="sre-showname">' + ((data[b].show.title != null) ? data[b].show.title : '') + ' <span>(' + data[b].show.year + ')</span></div><div class="sre-episodename"><div class="sre-episode">S' + data[b].episode.season + ' EP' + data[b].episode.number + '</div>' + data[b].episode.title + '</div></div></button>');
                        break;
                    case "person":
                        if (!hasPeople) { $("#search-results-shows").addClass("visible"); hasPeople = true; }
                        var itemID = "sres-" + data[b].person.ids.trakt;
                        $("#search-results-people").append('<button data-personid="' + data[b].person.ids.trakt + '" class="search-results-item"><img id="'+itemID+'" unselectable="on" data-imgid="actor-' + data[b].person.ids.trakt + '" data-imgtype="actorsmall" data-tmdb="' + data[b].person.ids.tmdb + '" data-tvdb="' + data[b].person.ids.tvdb + '" /><span>' + data[b].person.name + '</span></button>');
                        break;
                }

            }

            $.each($("#search-results-container img"), function (index) {
                var sender = this;
                var params = { "tmdb": sender.dataset.tmdb, "tvdb": sender.dataset.tvdb, "imgid": sender.dataset.imgid, "imgtype": sender.dataset.imgtype, "id": sender.id, "season":sender.dataset.season,"episode":sender.dataset.episode };
                cacherAPI.get(params).then((res) => {
                    sender.src = (res.poster !== undefined) ? res.poster.small : '';
                    $(sender).parent().addClass("isvisible");
                });
            });
            

            setTimeout(function () {
                $("#search-results-episodes .search-results-item").click(function () {
                    var base = this;
                    traktvHandlers.getEpisode($(base).data("showname"), $(base).data("showid"), $(base).data("season"), $(base).data("episode"));
                });
                $("#search-results-shows").css({ "width": ($("#search-results-shows")[0].scrollWidth + traktvHandlers.getRem(8)) });
                $("#search-results-movies").css({ "width": ($("#search-results-movies")[0].scrollWidth + traktvHandlers.getRem(8)) });
                $("#search-results-episodes").css({ "width": ($("#search-results-episodes")[0].scrollWidth + traktvHandlers.getRem(8)) });
                $("#search-results-people").css({ "width": ($("#search-results-people")[0].scrollWidth + traktvHandlers.getRem(8)) });
            }, 800);

            $("#search-results-shows button").click(function () {
                var base = this;
                traktvHandlers.gotoShow($(base).data("showid"));
            });
            $("#search-results-movies button").click(function () {
                var base = this;
                traktvHandlers.gotoMovie($(base).data("movieid"));
            });
        });
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
