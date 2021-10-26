(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    var showid, commentspage = 1, showidtmdb, showidtvdb;
    WinJS.UI.Pages.define("/pages/show.html", {
        ready: function (element, options) {
            cacherAPI.clearQueue();
            commentspage = 1;
            Ornate.currentShow = options.showid;
            trakt.currentMedia = options.showid;
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            WinJS.Resources.processAll();
            
            trakt().fanart.scroll($(".show #showdetails"));

            
            
            $("#menubar").addClass("showback");
            $("body").removeClass();

            $(".show-opentrailer").click(function () {
                var base = this;
                $("#youtubeplayer").css({ display: "block", transform: "scale(1)", opacity: 1 });
                $("#youtubeplayer .yp-frame").html('<iframe id="ytplayer" type="text/html" width="720" height="405" src="https://www.youtube.com/embed/' + $(base).data("videoid") + '?autoplay=1&disablekb=1&rel=0&autohide=1&color=white&iv_load_policy=3&theme=light&vq=highres&controls=0&showinfo=0" frameborder="0" allowfullscreen allowtransparency="true"></iframe>');
            });
            $(".show-getamazon").click(function () {
                var base = this;
                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri('http://www.amazon.co.uk/gp/search?tag=trakttv-21&keywords=' + $(".show-getamazon").data("query").replace(/ /g, '+')));
            });


            traktAPI.getShowSummary(Ornate.currentShow).done(function (data) {
                if (traktAPI.isTest) console.log(data);

                //PROCESS SHOW
                



                showidtmdb = data.ids.tmdb;
                showidtvdb = data.ids.tvdb;
                $("#show-movie-name").html(data.title + "<span>(" + data.year + ")</span>").addClass("visible");
                $(".show-getamazon").data("query",data.title);

                $("#show-info").html(data.year + "&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;" + data.runtime + "min&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;" + data.status + "&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;" + data.network + "&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;");
                if (data.genres.length > 1) {
                    $("#show-info").append(data.genres[0]);
                    for (var a = 1; a < data.genres.length; a++)
                        $("#show-info").append(", " + data.genres[a]);
                }
                else $("#show-info").append(data.genres[0]);
                $("#show-description").text(data.overview);

                $("#show-likecount").html(((Math.round(data.rating * 10) / 10) * 10) + '% <button></button><div id="show-likecount-rateit"><button data-heart="1"></button><button data-heart="2"></button><button data-heart="3"></button><button data-heart="4"></button><button data-heart="5"></button><button data-heart="6"></button><button data-heart="7"></button><button data-heart="8"></button><button data-heart="9"></button><button data-heart="10"></button></div>').off("click").on("click", function () {
                    trakt().rate.show(this, "shows", data.ids.trakt);
                });


                $("#show-rating").html('<span>' + (Math.round(data.rating * 10) / 10) + '</span>');
                if (data.certification != "")
                    $("#show-certification").text(data.certification).css({ display: "block" });

                if (data.trailer != "" && data.trailer != null) {
                    var url = data.trailer;
                    var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);


                    $(".show-opentrailer").data("videoid", videoid[1]).css({ display: "block" });
                }
                var params = { "tmdb": data.ids.tmdb, "tvdb": data.ids.tvdb, "imgid": "show-posterbig-" + Ornate.currentShow, "imgtype": "showposterbig", "id": "#show-poster" };
                cacherAPI.get(params).then(function (res) {
                    $("#show-poster").attr("src", res.poster.big);
                    $("#show-poster").addClass("visible");

                });

                var params = { "tmdb": data.ids.tmdb, "tvdb": data.ids.tvdb, "imgid": "show-fanartbig-" + Ornate.currentShow, "imgtype": "showfanartbig", "id": "fanart" };
                trakt().fanart.load(("show-fanartbig-" + Ornate.currentShow), params);

                
               

            
                $("#show-seasons").empty();
                traktAPI.getShowSeasons(Ornate.currentShow).done(function (data) {
                    for (var b = 0; b < data.length; b++) {
                        var itemID = "ss-" + Ornate.currentShow + "-" + data[b].number;

                        if (data[b].number != 0) {
                            var tile = Ornate.Tiles.Templates.seasonTile({
                                id: itemID,
                                show: {
                                    trakt: Ornate.currentShow,
                                    tvdb: showidtvdb,
                                    tmdb: showidtmdb
                                },
                                season: data[b].number
                            });

                            $("#show-seasons").append(tile);
                        }

                    }
                    $("#show-seasons").css({ "width": ($("#show-seasons .item").outerWidth(true) * Math.ceil($("#show-seasons .item").length / 2)) });

                    Ornate.Tiles.addEvents();

                    $.each($("#show-seasons img"), function (index) {
                        cacherAPI.preCache(this, index,1);
                    });

                

                }).fail(function (data) { });
            }).fail(function (data) { });

            /*
             * Get Cast Members
             */
            traktAPI.getShowPeople(Ornate.currentShow).done(function (data) {
                Ornate.Panels.createPersonPanel("#show-cast", data.cast);
            }).fail(function (data) {
                console.log(data);
            });

            traktAPI.getShowComments(Ornate.currentShow).done(function (data) {
                
                if (traktAPI.isTest) console.log(data);
                if (data.length > 0) {
                    for (var b = 0; b < data.length; b++) {
                        var itemID = "scom-" + data[b].id;

                        var usercomment = data[b].comment.replace("/&gt;(.*?)(?:\r\n|\r|\n)/gi", '<blockquote>$1</blockquote>')
                        usercomment = usercomment.replace("/(?:\r\n|\r|\n)/g", '<br />');
                        usercomment = usercomment.replace(/\[spoiler\]/g, '<span class="spoiler">');
                        usercomment = usercomment.replace(/\[\/spoiler\]/g, '</span>');

                        if (data[b].user.private)
                            $("#show-comments").append('<div id="'+itemID+'-item" class="comment-item private' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img id="'+itemID+'-img" unselectable="on" src="/assets/noavatar.png" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + data[b].user.username + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes</div></div><div class="mci-comment">' + usercomment + '</div></div>');
                        else
                            $("#show-comments").append('<div id="'+itemID+'-item" class="comment-item public' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img id="'+itemID+'-img" unselectable="on" src="' + ((data[b].user.images.avatar.full != null) ? data[b].user.images.avatar.full : '/assets/noavatar.png') + '" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + ((data[b].user.name != null && data[b].user.name != "") ? data[b].user.name : data[b].user.username) + ((data[b].user.vip) ? ' <span class="mci-vip">VIP</span>' : (data[b].user.vip_ep) ? ' <span class="mci-vip">VIP EP</span>' : '') + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes</div></div><div class="mci-comment">' + usercomment + '</div></div>');

                    }
                    if (data.length >= 10) {
                        $("#show-comments").append('<button class="comments-btnmore">Show more</button>');
                        $("#show-comments .comments-btnmore").on("click", function () {
                            commentspage++;
                            traktAPI.getShowComments(Ornate.currentShow, commentspage).done(function (data) {
                                if (data.length > 0) {
                                    for (var b = 0; b < data.length; b++) {
                                        var itemID = "scom-" + data[b].id;
                                        var usercomment = data[b].comment;
                                        usercomment = usercomment.replace(/\[spoiler\]/g, '<span class="spoiler">');
                                        usercomment = usercomment.replace(/\[\/spoiler\]/g, '</span>');
                                        if (data[b].user.private)
                                            $("#show-comments .comments-btnmore").before('<div class="comment-item private hidden' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img  id="' + itemID + '-img" unselectable="on" src="/assets/noavatar.png" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + data[b].user.username + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes</div></div><div class="mci-comment">' + usercomment + '</div></div>');
                                        else
                                            $("#show-comments .comments-btnmore").before('<div class="comment-item public hidden' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img  id="' + itemID + '-img" unselectable="on" src="' + ((data[b].user.images.avatar.full != null) ? data[b].user.images.avatar.full : 'ms-appx:///assets/noavatar.png') + '" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + ((data[b].user.name != null && data[b].user.name != "") ? data[b].user.name : data[b].user.username) + ((data[b].user.vip) ? ' <span class="mci-vip">VIP</span>' : (data[b].user.vip_ep) ? ' <span class="mci-vip">VIP EP</span>' : '') + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes</div></div><div class="mci-comment">' + usercomment + '</div></div>');

                                    }
                                    if (data.length < 10) {
                                        $("#movie-comments .comments-btnmore").remove();
                                    }
                                }
                                var c = 0;
                                $.each($("#show-comments .comment-item.hidden"), function () {
                                    var sender = this;
                                    setTimeout(function () {
                                        $(sender).removeClass("hidden");
                                    }, (c * 100));
                                    c++;
                                });




                            }).fail(function (data) { console.log(data); });
                        });
                    }
                }
                else $("#show-comments").text("Not comments yet");
                appProgress.hide();
            }).fail(function (data) { console.log(data); });

            traktAPI.getRelatedShows(Ornate.currentShow).done(function (data) {
                $("#debug").val(JSON.stringify(data));
                if (traktAPI.isTest) console.log(data);
                var trk_episodes = data;
                for (var b = 0; b < trk_episodes.length; b++) {
                    var itemID = "rels-" + trk_episodes[b].ids.trakt;


                    $("#show-related").append('<button id="' + itemID + '-item" data-showid="' + trk_episodes[b].ids.trakt + '" class="show-related-item"><img id="' + itemID + '-img" unselectable="on" data-imgid="show-postersmall-' + trk_episodes[b].ids.trakt + '" data-imgtype="showpostersmall" data-tvdb="' + trk_episodes[b].ids.tvdb + '" data-tmdb="' + trk_episodes[b].ids.tmdb + '" /><span>' + trk_episodes[b].title + '</span></button>');

                }

                $("#show-related button").click(function () {
                    var base = this;
                    traktvHandlers.gotoShow($(base).data("showid"));
                });


                $.each($("#show-related img"), function (index) {
                    cacherAPI.preCache(this, index,1);
                });



                appProgress.hide();
            }).fail(function (data) { });



            traktAPI.getShowWatching(Ornate.currentShow).done(function (data) {
                $("#show-watching").text(data.length);
            }).fail(function (data) { });



            if (trakt().login.status()) {
                traktAPI.getShowWatchedProgress(Ornate.currentShow).done(function (data) {
                    if (data.completed == data.aired) {
                        $(".show-addhistory").attr("disabled", "").addClass("inwatchlist");
                    }
                }).fail(function (data) { console.log(data); });

                var traktUserSettings = JSON.parse(Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings']);
                traktAPI.getUsersWatching(traktUserSettings.user.username).done(function (data2, textStatus, xhr) {
                    if (xhr.status == 200) {
                        $(".show-checkin").attr("disabled", "");
                        $(".show-checkin span").text("Can't checkin. You're already watching something.");
                        $("#upg-info").text(((data2.type == "movie") ? data2.movie.title : (data2.show.title + " - " + data2.episode.title)));
                    } else if (xhr.status == 204) {
                    }
                });
                //COMMENTS EVENT HOOKS
                trakt().comments.init();
            }
            $(".show-checkin").click(function () {
                if (trakt().login.require())
                    checkin();
            });
            $(".show-addhistory").click(function () {
                trakt().history.show($(".show-addhistory"), "shows", Ornate.currentShow);
            });
           
        },

        unload: function () {

        },
        getAnimationElements: function () {
            return [this.element.querySelector("section")];
        }
    });
    function checkin() {
        var myPackage = Windows.ApplicationModel.Package.current
        var traktUserSettings = JSON.parse(Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings']);
        var movieinfo = {
            "show": {
                "ids": {
                    "trakt": Ornate.currentShow,
                }
            },
            "sharing": {
                "facebook": traktUserSettings.connections.facebook,
                "twitter": traktUserSettings.connections.twitter,
                "tumblr": traktUserSettings.connections.tumblr
            },
            "message": "It's TV time :D",
            "app_version": myPackage.id.version.major + "." + myPackage.id.version.minor + "." + myPackage.id.version.build + "." + myPackage.id.version.revision,
            "app_date": "2016-04-10"
        };
        traktAPI.doCheckin(movieinfo).done(function (data, textSTatus, xhr) {
            console.log(data);
            traktvHandlers.showSuccess();
        }).fail(function (data) {
            console.log(data);
        });
    }
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
    
})();
