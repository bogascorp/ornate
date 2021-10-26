(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    var showname;
    WinJS.UI.Pages.define("/pages/season.html", {
        ready: function (element, options) {
            console.log(options);
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            WinJS.Resources.processAll();
            $("#menubar").addClass("showback");
            $("body").removeClass();

            $(".col1 h1").html("Season "+options.season);

            traktAPI.getShowSummary(options.trakt).done(function (data) {
                var data = data;
                showname = data.title;
                $("#show-movie-name").html(data.title + "<span>(" + data.year + ")</span>").addClass("visible");

                var params = { "tmdb": data.ids.tmdb, "tvdb": data.ids.tvdb, "imgid": "show-fanartbig-" + options.trakt, "imgtype": "showfanartbig", "id": "fanart" };
                trakt().fanart.load(("show-fanartbig-" + options.trakt), params);



            }).fail(function (data) { });


            traktAPI.getShowSeasonsSeason(options.trakt, options.season).done(function (data, textStatus, xhr) {
                console.log(data);
                $("#debug").text(JSON.stringify(data));

                for (var b = 0; b < data.length; b++) {
                    var itemID = "se-" + data[b].number;

                   var tile = Ornate.Tiles.Templates.episodeTileAlt({
                        id: itemID,
                        trakt: data[b].ids.trakt,
                        show: {
                            trakt: options.trakt,
                            tvdb: options.tvdb,
                            tmdb: options.tmdb
                        },
                        season: data[b].season,
                        episode: data[b].number,
                        labelSmall: data.title,
                        showName: showname,
                        caption: 'Episode ' + data[b].number,
                        captionSmall: ((data[b].title != null) ? data[b].title : 'TBA'),
                        label: ((data[b].overview) ? data[b].overview : '')
                    });
                    $("#season-episodes").append(tile);

                }
                $("#season-episodes .description").dotdotdot();
                $("#season-episodes").css({ "width": ($("#season-episodes .item").outerWidth(true) * Math.ceil($("#season-episodes .item").length / 3)) });
                

                $.each($("#season-episodes img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });



                    $("#season-episodes .item").click(function () {
                        var base = this;
                        traktvHandlers.getEpisode($(base).data("showname"), $(base).data("showid"), $(base).data("season"), $(base).data("episode"), $(base).data("tmdb"));
                    });
                

 appProgress.hide();
            }).fail(function (data) { });


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
