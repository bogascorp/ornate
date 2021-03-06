(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    var movieid, commentspage = 1, movietmdb, movietvdb;
    WinJS.UI.Pages.define("/pages/movie.html", {
        ready: function (element, options) {
            movieid = options.movieid;
            trakt.currentMedia = options.movieid;
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            WinJS.Resources.processAll();
           // trakt().fanart.show();
            trakt().fanart.scroll($(".movie #moviedetails"));


            $("#menubar").addClass("showback");
            $("body").removeClass();

            

            $(".movie-opentrailer").off("click").click(function () {
                var base = this;
                $("#youtubeplayer").css({ display: "block", transform: "scale(1)", opacity: 1 });
                $("#youtubeplayer .yp-frame").html('<iframe id="ytplayer" type="text/html" width="720" height="405" src="https://www.youtube.com/embed/' + $(base).data("videoid") + '?autoplay=1&disablekb=1&rel=0&autohide=1&color=white&iv_load_policy=3&theme=light&vq=highres&controls=0&showinfo=0" frameborder="0" allowfullscreen allowtransparency="true"></iframe>');
            });

            $(".movie-getamazon").click(function () {
                var base = this;
                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri('http://www.amazon.co.uk/gp/search?tag=trakttv-21&keywords=' + $(".movie-getamazon").data("query").replace(/ /g, '+')));
            });

            traktAPI.getMovieSummary(movieid).done(function (data) {
                //$("#debug").val(JSON.stringify());

                
                //PROCESS SHOW
                

                movietmdb = data.ids.tmdb;
                movietvdb = data.ids.tvdb;

                if (data.tagline != "") {
                    $("#movie-tag").html('&ldquo;' + data.tagline + '&rdquo;').css({ display: "block" });
                }


                if (data.trailer != "" && data.trailer != null) {
                    var url = data.trailer;
                    var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);


                    $(".movie-opentrailer").data("videoid", videoid[1]).css({ display: "block" });
                }

                $("#show-movie-name").html(data.title + "<span>(" + data.year + ")</span>").addClass("visible");
                $(".movie-getamazon").data("query", data.title);
                $("#movie-info").html(data.runtime + "min&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;released " + data.released + "&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;");
                if (data.genres.length > 1) {
                    $("#movie-info").append(data.genres[0]);
                    for (var a = 1; a < data.genres.length; a++)
                        $("#movie-info").append(", " + data.genres[a]);
                }
                else $("#movie-info").append(data.genres[0]);
                $("#movie-description").text(data.overview);

                $("#movie-likecount").html(((Math.round(data.rating * 10) / 10) * 10) + '% <button></button><div id="movie-likecount-rateit"><button data-heart="1"></button><button data-heart="2"></button><button data-heart="3"></button><button data-heart="4"></button><button data-heart="5"></button><button data-heart="6"></button><button data-heart="7"></button><button data-heart="8"></button><button data-heart="9"></button><button data-heart="10"></button></div>').off("click").on("click", function () {
                    trakt().rate.show(this, "movies", data.ids.trakt);
                });
                
                
                $("#movie-rating").html('<span>' + (Math.round(data.rating * 10) / 10) + '</span>');
                if (data.certification != null)
                    $("#movie-certification").text(data.certification).css({ display: "block" });


                var params = { "tmdb": data.ids.tmdb, "tvdb": data.ids.tvdb, "imgid": "movie-posterbig-" + movieid, "imgtype": "movieposterbig", "id": "movie-poster" };
                cacherAPI.get(params).then(function (res) {

                    $("#movie-poster").attr("src", res.src);
                    $("#movie-poster").addClass("visible");

                });

                var params2 = { "tmdb": data.ids.tmdb, "tvdb": data.ids.tvdb, "imgid": "movie-fanartbig-" + movieid, "imgtype": "moviefanartbig", "id": "fanart" };
                trakt().fanart.load(("movie-fanartbig-" + movieid), params2);



                
            }).fail(function (data) { });

           traktAPI.getMoviePeople(movieid).done(function (data) {
                //$("#debug").val(JSON.stringify(data));

                if (typeof data.crew !== "undefined") {
                    for (var b = 0; b < data.crew.directing.length; b++) {
                        if (data.crew.directing[b].job == "Director")
                            $("#movie-director").text(data.crew.directing[b].person.name);
                    }
                }

                if (typeof data.cast !== "undefined") {


                    Ornate.Panels.createPersonPanel("#movie-cast", data.cast);
                    


                } else { $("#movie-cast").html('<div class="font-size:1rem">No actors have been casted for the movies yet</div>').css({width:"6rem"}); }


                


                appProgress.hide();
            }).fail(function (data) { });

            traktAPI.getMovieComments(movieid).done(function (data) {
                $("#debug").val(JSON.stringify(data));
               
                if (data.length > 0) {
                    for (var b = 0; b < data.length; b++) {
                        var itemID = "scom-" + data[b].id;

                        var usercomment = data[b].comment.replace(/&gt;(.*?)(?:\r\n|\r|\n)/gi, '<blockquote>$1</blockquote>')
                        usercomment = usercomment.replace(/(?:\r\n|\r|\n)/g, '<br />');
                        usercomment = usercomment.replace('[spoiler]', '<span class="spoiler">');
                        usercomment = usercomment.replace('[/spoiler]', '</span>');

                        if (data[b].user.private)
                            $("#movie-comments").append('<div class="comment-item private' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img id="' + itemID + '-img" unselectable="on" src="ms-appx:///assets/noavatar.png" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + data[b].user.username + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;' + data[b].replies + ' replies</div></div><div class="mci-comment">' + usercomment + '</div></div>');
                        else
                            $("#movie-comments").append('<div class="comment-item public' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img id="' + itemID + '-img" unselectable="on" src="' + ((data[b].user.images.avatar.full != null) ? data[b].user.images.avatar.full : 'ms-appx:///assets/noavatar.png') + '" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + ((data[b].user.name != null && data[b].user.name != "") ? data[b].user.name : data[b].user.username) + ((data[b].user.vip) ? ' <span class="mci-vip">VIP</span>' : (data[b].user.vip_ep) ? ' <span class="mci-vip">VIP EP</span>' : '') + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;' + data[b].replies + ' replies</div></div><div class="mci-comment">' + usercomment + '</div></div>');

                    }

                    if (data.length >= 10) {
                        $("#movie-comments").append('<button class="comments-btnmore">Show more</button>');
                        $("#movie-comments .comments-btnmore").on("click", function () {
                            commentspage++;
                            traktAPI.getMovieComments(movieid, commentspage).done(function (data) {
                                if (data.length > 0) {
                                    for (var b = 0; b < data.length; b++) {
                                        var itemID = "scom-" + data[b].id;
                                        var usercomment = data[b].comment;
                                        usercomment = usercomment.replace('[spoiler]', '<span class="spoiler">');
                                        usercomment = usercomment.replace('[/spoiler]', '</span>');
                                        if (data[b].user.private)
                                            $("#movie-comments .comments-btnmore").before('<div class="comment-item private hidden' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img id="' + itemID + '-img" unselectable="on" src="ms-appx:///assets/noavatar.png" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + data[b].user.username + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes</div></div><div class="mci-comment">' + usercomment + '</div></div>');
                                        else
                                            $("#movie-comments .comments-btnmore").before('<div class="comment-item public hidden' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img  id="' + itemID + '-img" unselectable="on" src="' + ((data[b].user.images.avatar.full != null) ? data[b].user.images.avatar.full : 'ms-appx:///assets/noavatar.png') + '" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + ((data[b].user.name != null && data[b].user.name != "") ? data[b].user.name : data[b].user.username) + ((data[b].user.vip) ? ' <span class="mci-vip">VIP</span>' : (data[b].user.vip_ep) ? ' <span class="mci-vip">VIP EP</span>' : '') + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes</div></div><div class="mci-comment">' + usercomment + '</div></div>');

                                    }
                                    if (data.length < 10) {
                                        $("#movie-comments .comments-btnmore").remove();
                                    }
                                }
                                var c = 0;
                                $.each($("#movie-comments .comment-item.hidden"), function () {
                                    var sender = this;
                                    setTimeout(function () {
                                        $(sender).removeClass("hidden");
                                    }, (c * 100));
                                    c++;
                                });


                            }).fail(function (data) { console.log(data); });
                        });
                    }

                } else $("#movie-comments").text("Not comments yet");


                appProgress.hide();
            }).fail(function (data) { });

            traktAPI.getRelatedMovies(movieid).done(function (data) {
                
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "relm-" + trk_episodes[b].ids.trakt;

                    var tile = Ornate.Tiles.Templates.movieTile({
                        id: itemID,
                        trakt: trk_episodes[b].ids.trakt,
                        tmdb: trk_episodes[b].ids.tmdb,
                        title: trk_episodes[b].title
                    });
                    $("#movie-related").append(tile); 


                }

                $("#movie-related button").click(function () {
                    var base = this;
                    traktvHandlers.gotoMovie($(base).data("movieid"));
                });
                
                $.each($("#movie-related img"), function (index) {
                    cacherAPI.preCache(this, index, 1);
                });



                appProgress.hide();
            }).fail(function (data) { });

            /*traktAPI.getMovieStats(movieid).done(function (data) {
                $("#movie-stats").append('<div>Watcher <span>' + data.watchers + '</span></div>');
                $("#movie-stats").append('<div>Plays <span>' + data.plays + '</span></div>');
                $("#movie-stats").append('<div>Collectors <span>' + data.collectors + '</span></div>');
                $("#movie-stats").append('<div>Comments <span>' + data.comments + '</span></div>');
                $("#movie-stats").append('<div>Lists <span>' + data.lists + '</span></div>');
                $("#movie-stats").append('<div>Votes <span>' + data.votes + '</span></div>');
            }).fail(function (data) { });*/

            traktAPI.getMovieWatching(movieid).done(function (data) {
                $("#movie-watching").text(data.length);
            }).fail(function (data) { });

            /*traktAPI.getMovieRatings(movieid).done(function (data) {
                $("#totalratings").text(data.votes);
                $(".movie-rating-distribution").html('<li style="height:' + ((100 * data.distribution['1']) / data.votes) + '%"></li><li style="height:' + ((100 * data.distribution['2']) / data.votes) + '%"></li><li style="height:' + ((100 * data.distribution['3']) / data.votes) + '%"></li><li style="height:' + ((100 * data.distribution['4']) / data.votes) + '%"></li><li style="height:' + ((100 * data.distribution['5']) / data.votes) + '%"></li><li style="height:' + ((100 * data.distribution['6']) / data.votes) + '%"></li><li style="height:' + ((100 * data.distribution['7']) / data.votes) + '%"></li><li style="height:' + ((100 * data.distribution['8']) / data.votes) + '%"></li><li style="height:' + ((100 * data.distribution['9']) / data.votes) + '%"></li><li style="height:' + ((100 * data.distribution['10']) / data.votes) + '%"></li>');
            }).fail(function (data) { });*/

            /*setTimeout(function () {
                traktAPI.getMovieWatching(movieid).done(function (data) {
                    $("#movie-watching").text(data.length);
                }).fail(function (data) { });
            }, (30 * 1000)); //30 sec*/

            if (trakt().login.status()) {
                traktAPI.getMovieWatchedHistory(movieid).done(function (data) {
           
                    if (data.length > 0 && data[0].action == "watch") {
                        $(".movie-addhistory").attr("disabled", "").addClass("inwatchlist");
                    }
                }).fail(function (data) { console.log(data); });

                var traktUserSettings = Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings'];

                traktUserSettings = JSON.parse(traktUserSettings);
                traktAPI.getUsersWatching(traktUserSettings.user.username).done(function (data2, textStatus, xhr) {
                   
                    if (xhr.status == 200) {
                        $(".movie-checkin").attr("disabled", "");
                        $(".movie-checkin span").text("Can't checkin. You're already watching something.");
                        $("#upg-info").text(((data2.type == "movie") ? data2.movie.title : (data2.show.title + " - " + data2.episode.title)));
                    } else if (xhr.status == 204) {
                    }
                });
                //COMMENTS EVENT HOOKS
                trakt().comments.init();

            }

            $(".movie-checkin").click(function () {
                if (trakt().login.require())
                    checkinMovie();
            });

            $(".movie-addhistory").click(function () {
                trakt().history.show($(".movie-addhistory"), "movies", movieid);
            });
        },

        unload: function () {

        },
        getAnimationElements: function () {
            return [this.element.querySelector("section")];
        }
    });


    function linkClickEventHandler(eventInfo) {
        cacherAPI.clearQueue();
        var link = eventInfo.target;
        eventInfo.preventDefault();
        $("#show-movie-name").removeClass("visible");
        $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
        setTimeout(function () {
            WinJS.Navigation.navigate(link.href);
            appProgress.show();
        }, 400);
    }

    function checkinMovie() {
        var myPackage = Windows.ApplicationModel.Package.current
        var traktUserSettings = JSON.parse(Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings']);
        var movieinfo = {
            "movie": {
                "ids": {
                    "trakt": movieid,
                }
            },
            "sharing": {
                "facebook": traktUserSettings.connections.facebook,
                "twitter": traktUserSettings.connections.twitter,
                "tumblr": traktUserSettings.connections.tumblr
            },
            "message": "Loving the effin movie!",
            "app_version": myPackage.id.version.major + "." + myPackage.id.version.minor + "." + myPackage.id.version.build + "." + myPackage.id.version.revision,
            "app_date": "2015-08-30"
        };
        traktAPI.doCheckin(movieinfo).done(function (data, textSTatus, xhr) {
            console.log(data);
        }).fail(function (data) {
            console.log(data);
        });
    }
})();
