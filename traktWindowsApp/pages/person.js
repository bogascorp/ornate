(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    WinJS.UI.Pages.define("/pages/person.html", {
        ready: function (element, options) {
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            trakt().fanart.hide();
            $("#menubar").addClass("showback");
            $("body").removeClass();
            WinJS.Resources.processAll();

            $(window).resize(function () {
                $("#person-movies").css({ "width": ($("#person-movies .person-movies-item").outerWidth(true) * Math.ceil($("#person-movies .person-movies-item").length / 2)) });
                $("#person-shows").css({ "width": ($("#person-shows .person-shows-item").outerWidth(true) * Math.ceil($("#person-shows .person-shows-item").length / 2)) });
            });
            
           
            traktAPI.getPeopleSummary(options.personid).done(function (data) {
                $("#debug").val(JSON.stringify(data));
                var data = data;
                $("#show-movie-name").html(data.name);
                $("#person-info").html(data.birthday + "&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;" + data.birthplace + ((data.death!=null)?("&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;passed away " + data.death):''));
                $("#person-description").text(data.biography);


                var params = { "tmdb": data.ids.tmdb, "tvdb": data.ids.tvdb, "imgid": "actorbig-" + options.personid, "imgtype": "actorbig", "id": "person-poster" };
                cacherAPI.get(params).then(function (res) {

                    $("#person-poster").attr("src", res.src);
                    $("#person-poster").addClass("visible");

                });




            }).fail(function (data) { });
            
          traktAPI.getPeopleMovies(options.personid).done(function (data) {
                $("#debug").val(JSON.stringify(data));
                console.log(data);
                var moviesCast = data.cast;
                if (typeof data.crew !== "undefined")
                    var moviesCrewProduction = data.crew.production;
                else var moviesCrewProduction = false;
                for (var b = 0; b < moviesCast.length; b++) {
                    var itemID = "pm-" + moviesCast[b].movie.ids.trakt;
                    $("#person-movies").append('<button data-movieid="' + moviesCast[b].movie.ids.trakt + '" class="person-movies-item"><div class="person-movies-image"><img id="' + itemID + '-img" unselectable="on" data-imgid="movie-postersmall-' + moviesCast[b].movie.ids.trakt + '" data-imgtype="moviepostersmall" data-tvdb="' + moviesCast[b].movie.ids.tvdb + '" data-tmdb="' + moviesCast[b].movie.ids.tmdb + '" /></div><span>' + moviesCast[b].movie.title + '</span>' + ((moviesCast[b].character != "") ? ('<strong>as ' + moviesCast[b].character + '</strong>') : '') + '</button>');

                }
                if (moviesCrewProduction)
                for (var b = 0; b < moviesCrewProduction.length; b++) {
                    var itemID = "pm-" + moviesCrewProduction[b].movie.ids.trakt;
                    $("#person-movies").append('<button data-movieid="' + moviesCrewProduction[b].movie.ids.trakt + '" class="person-movies-item"><div class="person-movies-image"><img id="' + itemID + '-img" unselectable="on" data-imgid="movie-postersmall-' + moviesCrewProduction[b].movie.ids.trakt + '" data-imgtype="moviepostersmall" data-tvdb="' + moviesCrewProduction[b].movie.ids.tvdb + '" data-tmdb="' + moviesCrewProduction[b].movie.ids.tmdb + '" /></div><span>' + moviesCrewProduction[b].movie.title + '</span>' + ((moviesCrewProduction[b].job != "") ? ('<strong>' + moviesCrewProduction[b].job + '</strong>') : '') + '</button>');

                }
                $("#person-movies").css({ "width": ($("#person-movies .person-movies-item").outerWidth(true) * Math.ceil($("#person-movies .person-movies-item").length / 2)) });
                $("#person-movies button").click(function () {
                    var base = this;
                    traktvHandlers.gotoMovie($(base).data("movieid"));
                });

                $.each($("#person-movies img"), function (index) {
                    var sender = this;
                    var params = { "tmdb": sender.dataset.tmdb, "tvdb": sender.dataset.tvdb, "imgid": sender.dataset.imgid, "imgtype": sender.dataset.imgtype, "id": sender.id };
                    setTimeout(function () {
                        cacherAPI.get(params).then(function (res) {
                            document.getElementById(res.params.id).src = res.src;
                            var ori = "#" + res.params.id;
                            $(ori).parent().addClass("isvisible");
                        });
                    }, (index * 333));
                });




                appProgress.hide();
            }).fail(function (data) { });
            
            traktAPI.getPeopleShows(options.personid).done(function (data) {
                $("#debug").val(JSON.stringify(data));
                console.log(data);
                var moviesCast = data.cast;
                if (typeof data.crew !== "undefined")
                    var moviesCrewProduction = data.crew.production;
                else var moviesCrewProduction = false;
                for (var b = 0; b < moviesCast.length; b++) {
                    var itemID = "ps-" + moviesCast[b].show.ids.trakt;
                    $("#person-shows").append('<button data-showid="' + moviesCast[b].show.ids.trakt + '" class="person-shows-item"><div class="person-shows-image"><img id="' + itemID + '-img" unselectable="on" data-imgid="show-postersmall-' + moviesCast[b].show.ids.trakt + '" data-imgtype="showpostersmall" data-tvdb="' + moviesCast[b].show.ids.tvdb + '" data-tmdb="' + moviesCast[b].show.ids.tmdb + '" /></div><span>' + moviesCast[b].show.title + '</span>' + ((moviesCast[b].character != "") ? ('<strong>as ' + moviesCast[b].character + '</strong>') : '') + '</button>');

                }
                
                $("#person-shows").css({ "width": ($("#person-shows .person-shows-item").outerWidth(true) * Math.ceil($("#person-shows .person-shows-item").length / 2)) });
                $("#person-shows button").click(function () {
                    var base = this;
                    traktvHandlers.gotoShow($(base).data("showid"));
                });

                $.each($("#person-shows img"), function (index) {
                    var sender = this;
                    var params = { "tmdb": sender.dataset.tmdb, "tvdb": sender.dataset.tvdb, "imgid": sender.dataset.imgid, "imgtype": sender.dataset.imgtype, "id": sender.id };
                    setTimeout(function () {
                        cacherAPI.get(params).then(function (res) {
                            document.getElementById(res.params.id).src = res.src;
                            var ori = "#" + res.params.id;
                            $(ori).parent().addClass("isvisible");
                        });
                    }, (index * 250));
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
