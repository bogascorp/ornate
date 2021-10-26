// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392286
(function () {
    "use strict";
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    var lockOrientation = Windows.Graphics.Display;
    var titleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;
    var titleBarHelper = CoreViewHelpers.CoreTitleBarHelper.getForCurrentView();
    var resourceNS = Windows.ApplicationModel.Resources.Core;
    var resourceMap = resourceNS.ResourceManager.current.mainResourceMap.getSubtree('Resources');
    var context = resourceNS.ResourceContext.getForCurrentView();
    var rem = function rem() {
        var html = document.getElementsByTagName('html')[0];
        return function () {
            return parseInt(window.getComputedStyle(html)['fontSize']);
        }
    }();
    var progressTimer, commentspage = 1;
    function getRem(length) {
        return (parseInt(length) * rem());
    }


    WinJS.Namespace.define("traktvHandlers", { gotoShow: gotoShow, gotoMovie: gotoMovie, getRem: getRem, processDateTime: processDateTime, gotoPerson: gotoPerson, gotoSeason: gotoSeason, getEpisode: getEpisode });

    WinJS.Namespace.define("appProgress", {
        show: function () {
            progressTimer = setTimeout(function () { $("#globalprogress").addClass("visible"); }, 3000);
        }, hide: function () {
            clearTimeout(progressTimer)
            $("#globalprogress").removeClass("visible");
        }
    });


    app.onactivated = function (args) {


        if (args.detail.kind === activation.ActivationKind.protocol) {
            if (args.detail.previousExecutionState === activation.ApplicationExecutionState.running) {
                console.log("WARM LOAD");
                console.log(args.detail.uri.host);
                console.log(args.detail.uri.queryParsed[0].value);
                

                //JUST DO STUFF
                

            }
            else {
                var size = {
                    height: 533,
                    width: 320
                }
                Windows.UI.ViewManagement.ApplicationView.getForCurrentView().setPreferredMinSize(size);
                titleBarHelper.extendViewIntoTitleBar = true;
                titleBar.backgroundColor = { a: 0, r: 53, g: 105, b: 194 };
                titleBar.foregroundColor = { a: 255, r: 255, g: 255, b: 255 };
                titleBar.inactiveBackgroundColor = { a: 0, r: 53, g: 105, b: 194 };
                titleBar.inactiveForegroundColor = { a: 255, r: 255, g: 255, b: 255 };
                titleBar.buttonBackgroundColor = titleBar.buttonInactiveBackgroundColor = { a: 0, r: 0, g: 0, b: 0 };
                titleBar.buttonForegroundColor = { a: 255, r: 255, g: 255, b: 255 };


                if (!Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] || Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] === "") {
                    $(".menubar-profile").off("click keyup keydown keypress").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        doLogin();
                    });
                }
                else {
                    loadUserRelatedInfo();
                }

                if (!Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri'] || Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri'] === "") {
                    tmdbAPI.configuration();
                }
                if (!Windows.Storage.ApplicationData.current.roamingSettings.values['tvdb_token'] || Windows.Storage.ApplicationData.current.roamingSettings.values['tvdb_token'] === "") {
                    //tvdbAPI.login();
                }


                if (app.sessionState.history) {
                    nav.history = app.sessionState.history;
                }
                args.setPromise(WinJS.UI.processAll().then(function () {
                    if (nav.location) {
                        nav.history.current.initialPlaceholder = true;
                        return nav.navigate(nav.location, nav.state);
                    } else {
                        return nav.navigate(Application.navigator.home);
                    }
                }));

            }
        }
        else if (args.detail.kind === activation.ActivationKind.launch) {

            var size = {
                height: 533,
                width: 320
            }
            Windows.UI.ViewManagement.ApplicationView.getForCurrentView().setPreferredMinSize(size);

            //Windows.Storage.ApplicationData.current.localSettings.values['trk_accesstoken'] = false;
            titleBarHelper.extendViewIntoTitleBar = true;
            titleBar.backgroundColor = { a: 0, r: 53, g: 105, b: 194 };
            titleBar.foregroundColor = { a: 255, r: 255, g: 255, b: 255 };
            titleBar.inactiveBackgroundColor = { a: 0, r: 53, g: 105, b: 194 };
            titleBar.inactiveForegroundColor = { a: 255, r: 255, g: 255, b: 255 };
            titleBar.buttonBackgroundColor = titleBar.buttonInactiveBackgroundColor = { a: 0, r: 0, g: 0, b: 0 };
            titleBar.buttonForegroundColor = { a: 255, r: 255, g: 255, b: 255 };

            


            if (!Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] || Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] == "") {
                $(".menubar-profile").off("click keyup keydown keypress").on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    doLogin();
                });
            }
            else {
                loadUserRelatedInfo();
            }

            if (!Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri'] || Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri'] == "") {
                tmdbAPI.configuration();
            }
            if (!Windows.Storage.ApplicationData.current.roamingSettings.values['tvdb_token'] || Windows.Storage.ApplicationData.current.roamingSettings.values['tvdb_token'] == "") {
                //tvdbAPI.login();
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
        else {
            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }       

    };
    app.onready = function () {
        $("#menubar a").on("click", menuEventHandler);
        $("#menubar .menubar-goback").click(function () {
            $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
            setTimeout(function () {
                nav.back();
            }, 400);
            
        });
        $("#menubar .menubar-toggler").click(function (event) {
            $("#menubar").toggleClass("open");
        });

        $("#youtubeplayer .yp-overlay .yp-closebtn").click(function (event) {
            $("#youtubeplayer").css({ transform: "scale(1.2)", opacity: 0 });
            setTimeout(function () { $("#youtubeplayer").css({ display: "none" }); $("#youtubeplayer .yp-frame").empty(); }, 600);
        });

        $("#episode-details .ed-closebtn").click(function () {
            $("#episode-details").removeClass("isopen");
            setTimeout(function () {
                $("#episode-details .ed-cover-image img").removeAttr("src").removeClass("isvisible");
            },400);
        });

       
        $("#notificationBar .nb-header").off("click").on("click", function () {
            $("#notificationBar").toggleClass("isopen");
        });

        if (!Windows.Storage.ApplicationData.current.localSettings.values['trk_whatsnew3'])
        $("#announcementFrame").addClass("isopen");

        $("#announcementFrame .af-closebtn").off("click").on("click", function () {
            $("#announcementFrame").removeClass("isopen");
            Windows.Storage.ApplicationData.current.localSettings.values['trk_whatsnew3'] = "1";
        });

        

        
            var modernBanner;
            var modernBanner_timer;
            var modernBanner_duration = 1000;
            var modernBanner_duration_sec = "1s";
            var modernBanner_isanimating = false;
            modernBanner = {
                id: $(".bannerBlock"),
                timer: parseInt($(".bannerBlock").data("timer"))
            };

            $.each($(modernBanner.id).find(".bb-banners .bb-banners-item"), function (e) {
                $(modernBanner.id).find(".bb-position").append('<li></li>');
            });
            $(modernBanner.id).find(".bb-banners .bb-banners-item").eq(0).removeClass("in").addClass("inprogress");
            $(modernBanner.id).find(".bb-controls li").eq(0).addClass("active");

            $(modernBanner.id).find(".bb-goback").on("click", function () {
                clearInterval(modernBanner_timer);
                modernBanner_movePrevious();
            });
            $(modernBanner.id).find(".bb-goforward").on("click", function () {
                clearInterval(modernBanner_timer);
                modernBanner_moveNext();
            });

            function modernBanner_moveNext() {
                if (!modernBanner_isanimating) {
                    modernBanner_isanimating = true;
                    var prev = $(modernBanner.id).data("position");
                    $(modernBanner.id).find(".bb-banners .bb-banners-item").find("> div").css("transitionDuration", "0s");
                    $(modernBanner.id).find(".bb-banners .bb-banners-item").removeClass("out").addClass("in");
                    $(modernBanner.id).find(".bb-banners .bb-banners-item").eq(prev).removeClass("in");
                    setTimeout(function () {




                        $(modernBanner.id).find(".bb-banners .bb-banners-item").eq(prev).find("> div").css("transitionDuration", "2s");
                        $(modernBanner.id).find(".bb-banners .bb-banners-item").eq(prev).removeClass("inprogress").addClass("out");


                        $(modernBanner.id).data("position", (parseInt($(modernBanner.id).data("position")) + 1));
                        if (parseInt($(modernBanner.id).data("position")) > ($(modernBanner.id).find(".bb-banners .bb-banners-item").length - 1)) {
                            $(modernBanner.id).data("position", "0");
                        }
                        $(modernBanner.id).find(".bb-controls li").removeClass("active").eq(parseInt($(modernBanner.id).data("position"))).addClass("active");


                        setTimeout(function () {
                            $(modernBanner.id).find(".bb-banners .bb-banners-item").eq($(modernBanner.id).data("position")).find("> div").css("transitionDuration", modernBanner_duration_sec);
                            $(modernBanner.id).find(".bb-banners .bb-banners-item").eq($(modernBanner.id).data("position")).removeClass("in").addClass("inprogress");
                        }, 100);
                    }, 100);
                    setTimeout(function () {
                        modernBanner_isanimating = false;
                    }, modernBanner_duration);
                }
            }

            function modernBanner_movePrevious() {
                if (!modernBanner_isanimating) {
                    modernBanner_isanimating = true;
                    var prev = $(modernBanner.id).data("position");
                    $(modernBanner.id).find(".bb-banners .bb-banners-item").eq(prev).removeClass("inprogress").addClass("in");

                    $(modernBanner.id).data("position", (parseInt($(modernBanner.id).data("position")) - 1));
                    if (parseInt($(modernBanner.id).data("position")) < 0) {
                        $(modernBanner.id).data("position", ($(modernBanner.id).find(".bb-banners .bb-banners-item").length - 1));
                    }

                    $(modernBanner.id).find(".bb-controls li").removeClass("active").eq(parseInt($(modernBanner.id).data("position"))).addClass("active");
                    $(modernBanner.id).find(".bb-banners .bb-banners-item").eq($(modernBanner.id).data("position")).find("> div").css("transitionDuration", "0s");
                    $(modernBanner.id).find(".bb-banners .bb-banners-item").eq($(modernBanner.id).data("position")).removeClass("in").addClass("out");
                    setTimeout(function () {
                        $(modernBanner.id).find(".bb-banners .bb-banners-item").eq($(modernBanner.id).data("position")).find("> div").css("transitionDuration", modernBanner_duration_sec);
                        $(modernBanner.id).find(".bb-banners .bb-banners-item").eq($(modernBanner.id).data("position")).removeClass("out").addClass("inprogress");
                    }, 100);
                    setTimeout(function () {
                        modernBanner_isanimating = false;
                    }, modernBanner_duration);
                }
            }

            $("#infoRating .ia-stars").on("change", function (e) {
                switch (e.detail.tentativeRating) {
                    case 1: $("#infoRating .ia-stars-label").text("It was terrible!"); break;
                    case 2: $("#infoRating .ia-stars-label").text("Expected better"); break;
                    case 3: $("#infoRating .ia-stars-label").text("It was OK"); break;
                    case 4: $("#infoRating .ia-stars-label").text("Really good"); break;
                    case 5: $("#infoRating .ia-stars-label").text("Loved It!"); break;
                }
            });
            $("#watchedDateDialog-ratingcontrol").on("change", function (e) {
                switch (e.detail.tentativeRating) {
                    case 1: $("#watchedDateDialog .ia-stars-label").text("It was terrible!"); break;
                    case 2: $("#watchedDateDialog .ia-stars-label").text("Expected better"); break;
                    case 3: $("#watchedDateDialog .ia-stars-label").text("It was OK"); break;
                    case 4: $("#watchedDateDialog .ia-stars-label").text("Really good"); break;
                    case 5: $("#watchedDateDialog .ia-stars-label").text("Loved It!"); break;
                }
            });
            $(window).keyup(function (e) {
                if(e.keyCode==113)
                    $("#debuggerTools").toggleClass("isopen");
            });

            context.languages = ['en-US'];
            WinJS.Resources.processAll();
    };
    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };
    /*app.onerror = function (err, url, lineNumber) {
        trakt().debug('Error: ' + err + ' Script: ' + url + ' Line: ' + lineNumber, false);
    };*/
    app.start();

    function doLogin() {
        traktAPI.requestAuth(function () {
            loadUserRelatedInfo();
            $(".menubar-profile").off("click keyup keydown keypress");
        });
    }

    function gotoPerson(personid) {
        $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
        setTimeout(function () {
            WinJS.Navigation.navigate("/pages/person.html", { personid: personid });
        }, 400);
        appProgress.show();
    }
    function getEpisode(showname, showid, season, episode, tmdb) {
        traktAPI.getEpisodeSummary(showid, season, episode).done(function (data, textStatus, xhr) {
            $("#episode-details").data("showid", showid).data("episodeid", data.ids.trakt).data("episode", episode).data("season", season);



            $("#episode-details").addClass("isopen");

            var params = { "tmdb": tmdb, "imgid": "episode-screenshotbig-" + data.ids.trakt, "imgtype": "screenshotbig", "id": "episode-details", "season": season, "episode": episode };
            cacherAPI.get(params).then(function (res) {
                    $("#episode-details .ed-cover-image img").attr("src", res.screenshot.big).addClass("isvisible");
                });
   
            $("#episode-details .ed-cover-details-rating span").text((Math.round(data.rating * 10) / 10));
            $("#episode-details .ed-cover-details-showname").text(showname);
            $("#episode-details .ed-cover-details-episodename").text(data.title);
            $("#episode-details .ed-cover-details-episodeseason").text("Season " + season + " Episode " + episode);
            $("#episode-details .ed-cover-details-episodedetails").text(data.overview);

            $("#ed-addtowatched").removeAttr("disabled").removeClass("inwatchlist");

            $("#episode-comments").empty();

            //COMMENTS EVENT HOOKS
            trakt().comments.init();

            /*GET COMMENTS*/
            traktAPI.getEpisodeComments(showid, season, episode).done(function (data) {
                if (data.length > 0) {
                    for (var b = 0; b < data.length; b++) {
                        var itemID = "scom-" + data[b].id;

                        var usercomment = data[b].comment.replace(/&gt;(.*?)(?:\r\n|\r|\n)/gi, '<blockquote>$1</blockquote>')
                        usercomment = usercomment.replace(/(?:\r\n|\r|\n)/g, '<br />');


                        usercomment = usercomment.replace(/\[spoiler\]/g, '<span class="spoiler">');
                        usercomment = usercomment.replace(/\[\/spoiler\]/g, '</span>');

                        if (data[b].user.private)
                            $("#episode-comments").append('<div class="comment-item private' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img id="' + itemID + '-img" unselectable="on" src="ms-appx:///assets/noavatar.png" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + data[b].user.username + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;' + data[b].replies + ' replies</div></div><div class="mci-comment readfont">' + usercomment + '</div></div>');
                        else
                            $("#episode-comments").append('<div class="comment-item public' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img id="' + itemID + '-img" unselectable="on" src="' + ((data[b].user.images.avatar.full != null) ? data[b].user.images.avatar.full : 'ms-appx:///assets/noavatar.png') + '" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + ((data[b].user.name != null && data[b].user.name != "") ? data[b].user.name : data[b].user.username) + ((data[b].user.vip) ? ' <span class="mci-vip">VIP</span>' : (data[b].user.vip_ep) ? ' <span class="mci-vip">VIP EP</span>' : '') + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;' + data[b].replies + ' replies</div></div><div class="mci-comment readfont">' + usercomment + '</div></div>');

                    }

                    if (data.length >= 10) {
                        $("#episode-comments").append('<button class="comments-btnmore">Show more</button>');
                        $("#episode-comments .comments-btnmore").off("click").on("click", function () {
                            commentspage++;
                            console.log(commentspage);
                            traktAPI.getEpisodeComments($("#episode-details").data("showid"), $("#episode-details").data("season"), $("#episode-details").data("episode"), commentspage).done(function (data) {
                                console.log(data);
                                if (data.length > 0) {
                                    for (var b = 0; b < data.length; b++) {
                                        var itemID = "scom-" + data[b].id;
                                        var usercomment = data[b].comment;
                                        usercomment = usercomment.replace(/\[spoiler\]/g, '<span class="spoiler">');
                                        usercomment = usercomment.replace(/\[\/spoiler\]/g, '</span>');
                                        if (data[b].user.private)
                                            $("#episode-comments .comments-btnmore").before('<div class="comment-item private hidden' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img id="' + itemID + '-img" unselectable="on" src="ms-appx:///assets/noavatar.png" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + data[b].user.username + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes</div></div><div class="mci-comment">' + usercomment + '</div></div>');
                                        else
                                            $("#episode-comments .comments-btnmore").before('<div class="comment-item public hidden' + ((data[b].spoiler) ? ' spoiler' : '') + ((data[b].review) ? ' review' : '') + '" data-commentid="' + data[b].id + '"><div class="mci-header"><div class="mci-avatar"><img  id="' + itemID + '-img" unselectable="on" src="' + ((data[b].user.images.avatar.full != null) ? data[b].user.images.avatar.full : 'ms-appx:///assets/noavatar.png') + '" />' + ((data[b].user_rating != null) ? '<div class="mci-rating">' + data[b].user_rating + '</div>' : '') + '</div><div class="mci-userdata"><div class="mci-user">' + ((data[b].user.name != null && data[b].user.name != "") ? data[b].user.name : data[b].user.username) + ((data[b].user.vip) ? ' <span class="mci-vip">VIP</span>' : (data[b].user.vip_ep) ? ' <span class="mci-vip">VIP EP</span>' : '') + '</div><div class="mci-date">' + traktvHandlers.processDateTime(data[b].created_at) + '</div></div><div class="mci-infos">' + data[b].likes + ' likes</div></div><div class="mci-comment">' + usercomment + '</div></div>');

                                    }
                                    if (data.length < 10) {
                                        $("#episode-comments .comments-btnmore").remove();
                                    }
                                }
                                var c = 0;
                                $.each($("#episode-comments .comment-item.hidden"), function () {
                                    var sender = this;
                                    setTimeout(function () {
                                        $(sender).removeClass("hidden");
                                    }, (c * 100));
                                    c++;
                                });


                            }).fail(function (data) { console.log(data); });
                        });
                    }

                } else $("#episode-comments").text("Not comments yet");


                appProgress.hide();
            }).fail(function (data) { });



            
            $("#ed-addtowatched").off("click").on("click", function () {
                trakt().history.episode($("#ed-addtowatched"), "episodes", $("#episode-details").data("episodeid"));
            });
            $("#ed-gotoshow").off("click").on("click", function () {
                $("#episode-details").removeClass("isopen");
                gotoShow(showid);
            });

        }).fail(function (data) { });
    }
    function gotoShow(showid) {
        $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
        setTimeout(function () {
            WinJS.Navigation.navigate("/pages/show.html", { showid: showid });
        }, 400);
        appProgress.show();
    }
    function gotoSeason(params) {
        $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
        setTimeout(function () {
            WinJS.Navigation.navigate("/pages/season.html", params);
        }, 400);
        appProgress.show();
    }
    function gotoMovie(movieid) {
        $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
        setTimeout(function () {
            WinJS.Navigation.navigate( "/pages/movie.html", { movieid: movieid });
        }, 400);
        appProgress.show();
    }
    function loadUserRelatedInfo() {
        traktAPI.getUsersSettings().done(function (data) {
            Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings'] = JSON.stringify(data);
                $("#upg-username").text(data.user.username);
                $("#upg-profile").attr("src",data.user.images.avatar.full);


        });
    }
    function processDateTime(dateObject) {
        var d = new Date(dateObject);
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
        var diffDays = Math.ceil(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
        if (diffDays == 0) { //TODAY
            var completeDate = "Today at " + h + ":" + m + "" + dd;
        }
        else if (diffDays == 1) {
            var completeDate = "Tomorrow at " + h + ":" + m + "" + dd;
        }
        else if (diffDays < 7) {
            var completeDate = dateMonths[d.getMonth()] + " " + d.getDate() + " at " + h + ":" + m + "" + dd;
        }
        else var completeDate = dateMonths[d.getMonth()] + " " + d.getDate() + " at " + h + ":" + m + "" + dd;
        return completeDate;
    }
    function menuEventHandler(eventInfo) {
        $("#menubar").removeClass("open");
        var link = eventInfo.target;
        var uri = new Windows.Foundation.Uri(link.href);
        if (uri.host != "media" && uri.host != "user") {
            eventInfo.preventDefault();
            $("#show-movie-name").removeClass("visible");
            $("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
            var id = window.setTimeout(function () { }, 0);
            while (id--) { window.clearTimeout(id); }
            setTimeout(function () {
                WinJS.Navigation.navigate(link.href);
                appProgress.show();
            }, 400);
        }
    }
})();

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function replaceAll(str, map) {
    for (key in map) {
        str = str.replaceAll(key, map[key]);
    }
    return str;
}

(function () {
    "use strict";
    var trakt = function (params) {
        return new TraktInternal(params);
    };
    var TraktInternal = function (params) {
        this.version = "1.0";
        return params;
    };
    trakt.currentMedia = '';
    trakt.fn = TraktInternal.prototype =
        {
        toggleFullscreen: () => {
            var ViewManagement = Windows.UI.ViewManagement;
            var FullScreenSystemOverlayMode = ViewManagement.FullScreenSystemOverlayMode;
            var ApplicationView = ViewManagement.ApplicationView;

            var view = ApplicationView.getForCurrentView();
            if (view.isFullScreenMode) {
                view.exitFullScreenMode();
                WinJS.log && WinJS.log("Exiting full screen mode", "samples", "status");
                // The resize event will be raised when the exit from full screen mode is complete.
            } else {
                if (view.tryEnterFullScreenMode()) {
                    WinJS.log && WinJS.log("Entering full screen mode", "samples", "status");
                    // The resize event will be raised when the entry to full screen mode is complete.
                } else {
                    WinJS.log && WinJS.log("Failed to enter full screen mode", "samples", "error");
                }
            }
        },
        debug: function (text, isObject) {
            var isObject = isObject || true;
            console.log(text);
           $("#debuggerTools textarea").val($("#debuggerTools textarea").val() + ((isObject) ? JSON.stringify(text) : text) + "\r\n");
        },
        openFeedback: function () {
            
            
        },
        notifications : {
            init: function () {
                var taskRegistered = false;
                var background = Windows.ApplicationModel.Background;
                var iter = background.BackgroundTaskRegistration.allTasks.first();
                while (iter.hasCurrent) {
                    var task = iter.current.value;
                    if (task.name === "trakttvworkerv1") {
                        taskRegistered = true;
                        break;
                    }
                    iter.moveNext();
                }
                if (!taskRegistered) {
                    Windows.ApplicationModel.Background.BackgroundExecutionManager.requestAccessAsync().then(function () {
                        var builder = new Windows.ApplicationModel.Background.BackgroundTaskBuilder();
                        builder.name = "trakttvworkerv1";
                        builder.taskEntryPoint = "worker.js";
                        var timeTrigger = new Windows.ApplicationModel.Background.TimeTrigger((60 * 2), false);
                        builder.setTrigger(timeTrigger);
                        var conditionType = Windows.ApplicationModel.Background.SystemConditionType.internetAvailable;
                        var taskCondition = new Windows.ApplicationModel.Background.SystemCondition(conditionType);
                        builder.addCondition(taskCondition);
                        return builder.register();
                    });
                    
                }
            }
        },
        login: {
            require: function () {
                if (!trakt().login.status()) {
                    trakt().login.request();
                    return false;
                }
                else return true;
            },
            status: function () {
                return (Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken']) ? true : false;
            },
            request: function () {
                traktAPI.requestAuth(function () {
                    traktAPI.getUsersSettings().done(function (data) {
                        Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings'] = JSON.stringify(data);

                            $("#upg-username").text(data.user.username);

                        $("#upg-profile").attr("src", data.user.images.avatar.full);


                    });
                });
            }
        },
        /**
        * Information overlays
        */
        information: {
            success: function () {
                $("#infoOverlay").addClass("isvisible");
                $("#infoSuccess").addClass("isvisible");
                setTimeout(function () { $("#infoSuccess").removeClass("isvisible"); $("#infoOverlay").removeClass("isvisible"); }, 1500);
            },
            alert: function (description, title) {
                $("#infoOverlay").addClass("isvisible");
                $("#infoAlert .ia-button").off("click").on("click", function () {
                    $("#infoAlert").removeClass("isvisible");
                    $("#infoOverlay").removeClass("isvisible");
                }).focus();
                $("#infoAlert .ia-title").text(title);
                $("#infoAlert .ia-text").html(description);
                $("#infoAlert").addClass("isvisible");
            },
            ask: function (description, title, eventYes, eventNo, params, focus) {
                $("#infoOverlay").addClass("isvisible");
                var params = params || { "yes": "Yes", "No": "No" };
                var focus = focus || 'right';
                $("#infoAsk .ia-yes").text(params.yes).off("click").on("click", function () {
                    eventYes();
                    $("#infoAsk").removeClass("isvisible");
                    $("#infoOverlay").removeClass("isvisible");
                });
                $("#infoAsk .ia-no").text(params.no).off("click").on("click", function () {
                    eventNo();
                    $("#infoAsk").removeClass("isvisible");
                    $("#infoOverlay").removeClass("isvisible");
                });
                if (focus == "right") {
                    $("#infoAsk .ia-no").focus();
                }
                else {
                    $("#infoAsk .ia-yes").focus();
                }
                $("#infoAsk .ia-title").text(title);
                $("#infoAsk .ia-text").html(description);
                $("#infoAsk").addClass("isvisible");
            }
        },
        /**
        * Fanart
        */
        fanart: {
            show: function () {
                $(".fanart").addClass("visible");
                $(".fanart .fanart-overlay").css({ opacity: 1 });
            },
            load: function (media, params) {
                if (media != $("#fanart").data("src")) {
                    trakt().fanart.hide();
                    $("#fanart").data("src", media);
                    cacherAPI.get(params).then(function (res) {
                        $("#fanart").attr("src", res.fanart.big);
                        $(".fanart .fanart-overlay").css({ opacity: 1 });
                    }).then(function () {
                        $(".fanart .fanart-image").css({ "background-image": 'url(' + $("#fanart").attr("src") + ')' });
                        $(".fanart").addClass("visible");
                    });

                } else {
                    $(".fanart").addClass("visible");
                }
            },
            hide: function () {
                $(".fanart").removeClass("visible");
            },
            scroll: function (sender) {
                $(sender).off("scroll").on("scroll", function () {
                    if ($(this).scrollLeft() >= ($(this)[0].scrollWidth - ($(this).outerWidth() * 2))) {
                        var nopacity = 1 - (($(this).scrollLeft() - ($(this)[0].scrollWidth - ($(this).outerWidth() * 2)))) / $(this).outerWidth();
                        $(".fanart .fanart-overlay").css({ opacity: nopacity });
                    } else {
                        $(".fanart .fanart-overlay").css({ opacity: 1 });
                    }
                });
            }
        },
        /**
        * RATE
        */
        rate: {
            show: function (sender, media_type, media_id) {
                $("#infoOverlay").addClass("isvisible");
                $("#infoRating .ia-ratenow").off("click").on("click", function () {
                    var rating = 2 * document.getElementById("infoRating-control").winControl.userRating;
                    $("#infoRating").removeClass("isvisible");
                    $("#infoOverlay").removeClass("isvisible");
                    var media_object = {
                        [media_type]: [{
                            "rating":rating,
                            "ids": {
                                "trakt": media_id,
                            }
                        }]
                    };
                    traktAPI.addRating(media_object).done(function (data, textSTatus, xhr) {
                        console.log(data);
                        if (data.added.episodes > 0 || data.added.movies > 0 || data.added.shows > 0 || data.added.seasons > 0) {
                            trakt().rate.success(rating);
                        }

                    }).fail(function (data) {
                        console.log(data);
                    });                 
                });
                $("#infoRating .ia-cancel").off("click").on("click", function () {
                    $("#infoRating").removeClass("isvisible");
                    $("#infoOverlay").removeClass("isvisible");
                });
                $("#infoRating").addClass("isvisible");
            },
            success: function (value) {
                if (value >= 5)
                    $("#infoRatingHeart").addClass("like").addClass("visible");
                else
                    $("#infoRatingHeart").addClass("dislike").addClass("visible");
                setTimeout(function () {
                    $("#infoRatingHeart").removeClass("like").removeClass("dislike").removeClass("visible");
                    document.getElementById("infoRating-control").winControl.userRating = 0;
                }, 1000);
            }
        },
        /**
        * History
        */
        history: {
            show: function (sender, media_type, media_id) {
                if (trakt().login.require()) {
                    $("#watchedDateDialog .wdd-button-save").off("click").on("click", function () {
                        if ($('#wdd-rightnow').is(':checked')) {
                            var watched_at = new Date();
                            var media_object = {
                                [media_type]: [{
                                    "watched_at": watched_at.toISOString(),
                                    "ids": {
                                        "trakt": media_id,
                                    }
                                }]
                            };
                            trakt().history.add(media_object, function (data) {
                                if (data.added.episodes > 0 || data.added.movies > 0) {
                                    $(sender).attr("disabled", "").addClass("inwatchlist");
                                    trakt().information.success();
                                }
                            });
                        } 
                        else {
                            var media_object = {
                                [media_type]: [{
                                    "watched_at": "released",
                                    "ids": {
                                        "trakt": media_id,
                                    }
                                }]
                            };
                            trakt().history.add(media_object, function (data) {
                                if (data.added.episodes > 0 || data.added.movies > 0) {
                                    $(sender).attr("disabled", "").addClass("inwatchlist");
                                    trakt().information.success();

                                }
                            });
                        }
                        var rating = 2*document.getElementById("watchedDateDialog-ratingcontrol").winControl.userRating;
                        if (rating > 0) {
                            var media_object = {
                                [media_type]: [{
                                    "rating": rating,
                                    "ids": {
                                        "trakt": media_id,
                                    }
                                }]
                            };
                            traktAPI.addRating(media_object).done(function (data, textSTatus, xhr) {
                                //console.log(data);

                            }).fail(function (data) {
                                console.log(data);
                            }); 
                        }
                    });
                    $("#watchedDateDialog .wdd-button-close").off("click").on("click", function () {
                        console.log("off");
                        $("#watchedDateDialog").removeClass("isopen");
                        $("#infoOverlay").removeClass("isvisible");
                        document.getElementById("watchedDateDialog-ratingcontrol").winControl.userRating=0;
                    });
                    $("#infoOverlay").addClass("isvisible");
                    $("#watchedDateDialog").addClass("isopen");
                }
            },
            episode: function (sender, media_type, media_id) {
                if (trakt().login.require()) {
                    $("#watchedDateDialog .wdd-button-save").off("click").on("click", function () {
                        if ($('#wdd-rightnow').is(':checked')) {
                            var watched_at = new Date();
                            var media_object = {
                                [media_type]: [{
                                    "watched_at": watched_at.toISOString(),
                                    "ids": {
                                        "trakt": media_id,
                                    }
                                }]
                            };
                            trakt().history.add(media_object, function (data) {
                                if (data.added.episodes > 0 || data.added.movies > 0) {
                                    $(sender).attr("disabled", "").addClass("inwatchlist");
                                    trakt().information.success();
                                    $("#episode-details").removeClass("isopen");
                                }
                            });
                        }
                        else {
                            var media_object = {
                                [media_type]: [{
                                    "watched_at": "released",
                                    "ids": {
                                        "trakt": media_id,
                                    }
                                }]
                            };
                            trakt().history.add(media_object, function (data) {
                                if (data.added.episodes > 0 || data.added.movies > 0) {
                                    $(sender).attr("disabled", "").addClass("inwatchlist");
                                    trakt().information.success();
                                    var epid = ".episode-" + $("#episode-details").data("episodeid");
                                    $(epid).addClass("removing");
                                    setTimeout(function () { $(epid).remove(); }, 400);
                                    $("#episode-details").removeClass("isopen");

                                }
                            });
                        }
                        var rating = 2*document.getElementById("watchedDateDialog-ratingcontrol").winControl.userRating;
                        if (rating > 0) {
                            var media_object = {
                                [media_type]: [{
                                    "rating": rating,
                                    "ids": {
                                        "trakt": media_id,
                                    }
                                }]
                            };
                            traktAPI.addRating(media_object).done(function (data, textSTatus, xhr) {
                                //console.log(data);
                            }).fail(function (data) {
                                console.log(data);
                            });
                        }
                    });
                    $("#watchedDateDialog .wdd-button-close").off("click").on("click", function () {
                        $("#watchedDateDialog").removeClass("isopen");
                        $("#infoOverlay").removeClass("isvisible");
                    });
                    $("#infoOverlay").addClass("isvisible");
                    $("#watchedDateDialog").addClass("isopen");

                }
            },
            add: function (media_object, event) {
                traktAPI.addToHistory(media_object).done(function (data, textSTatus, xhr) {
                    event(data);
                    $("#watchedDateDialog").removeClass("isopen");
                    document.getElementById("watchedDateDialog-ratingcontrol").winControl.userRating = 0;
                    $("#infoOverlay").removeClass("isvisible");
                }).fail(function (data) {
                    console.log(data);
                });
            }
        },
        comments: {
            init: function () {
                $(".commentsOptions .co-toggler").off("click").on("click", function () {
                    $(this).parent().toggleClass("isopen");
                });
                $(".comments-form").addClass("islogged");
                $(".comments-stream").addClass("islogged");
                $(".comments-form button").on("click", function () {
                    trakt().comments.beforeSend($(".comments-form textarea"), this.dataset.mediatype);
                });
                $(".co-spoilerswitch").on("change", function () {
                    var streamer = "#"+this.dataset.container;
                    if (this.winControl.checked)
                        $(streamer).addClass("showSpoilers");
                    else
                        $(streamer).removeClass("showSpoilers");
                    $(".commentsOptions").toggleClass("isopen");
                });
            },
            beforeSend: function (sender, mediaType) {
                var validationStatus = trakt().comments.preValidate(sender);
                if (validationStatus === 0) {
                    document.getElementById("ia-check-english").value = 1;
                    
                    $("#infoComments .ia-button-spoilers").off("click").on("click", function () {
                        trakt().comments.add(mediaType, trakt.currentMedia, sender, true);
                        $("#infoComments").removeClass("isvisible");
                        $("#infoOverlay").removeClass("isvisible");
                    });
                    $("#infoComments .ia-button-nospoilers").off("click").on("click", function () {
                        trakt().comments.add(mediaType, trakt.currentMedia, sender, false);
                        $("#infoComments").removeClass("isvisible");
                        $("#infoOverlay").removeClass("isvisible");
                    });
                    $("#infoComments .ia-button-cancel").off("click").on("click", function () {
                        $("#infoComments").removeClass("isvisible");
                        $("#infoOverlay").removeClass("isvisible");
                    });

                    $("#infoComments").addClass("isvisible");
                    $("#infoOverlay").addClass("isvisible");
                }
                else if (validationStatus === 1) {
                    trakt().information.ask("It appears that your comment isn't in english. Can you confirm?", "It's not English?", function () {
                        trakt().information.alert("Sorry about that.<br>Only comments in english are allowed.", "You can't comment");
                        document.getElementById("ia-check-english").value = 0;
                    }, function () { document.getElementById("ia-check-english").value = 1; });
                }
                else if (validationStatus === 2) {
                    document.getElementById("ia-check-spoiler").checked = true;
                }
                else if (validationStatus === -1) {
                    trakt().information.alert("Sorry about that.<br>Try writing a little bit more about your experience.", "Comment to short");
                }
            },
            add: function (media_type, media_id, comment, isSpoiler) {
                //comment.replace('"', '\\"');
                var userSettings = JSON.parse(Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings']);
                var media_object = {
                            [media_type]: {
                                "ids": {
                                    "trakt": media_id,
                                }
                            },
                    "comment": $(comment).val(),
                    "spoiler": isSpoiler,
                    "sharing": {
                        "facebook": userSettings.connections.facebook,
                        "twitter": userSettings.connections.twitter,
                        "tumblr": userSettings.connections.tumblr,
                        "medium": userSettings.connections.medium,
                        "slack": userSettings.connections.slack,
                        "google": userSettings.connections.google
                    }
                };
                traktAPI.postComment(media_object).done(function (result) {
                    $(".comments-form textarea").val("");
                    trakt().information.ask("Thanks for sharing :)<br><br>It may take some time for your comment to show up.", "Comment Posted", function () {
                        trakt().comments.remove(result.id);
                    }, function () { }
                    , {"yes":"Undo", "no":"OK"}, "right")
                });
            },
            update: function () {

            },
            remove: function (commentid) {
                traktAPI.deleteComment(commentid).done(function (result, s, a) {
                    if(a.status==204)
                        trakt().information.alert("Your comment is now gone. So sad :'(", "Comment unposted");
                    else
                        trakt().information.alert("We couldn't unpost your comment.", "Something happened");
                });
            },
            like: function () {

            },
            unlike: function () {

            },
            reply: function () {

            },
            preValidate: function (sender) {
                /*
                * Comments must be at least 5 words.
                * Comments 200 words or longer will be automatically marked as a review.
                * Correctly indicate if the comment contains spoilers.
                * Only write comments in English - This is important!
                */
                var codeStatus = 0;
                var value = $(sender).val();
                if (value.length == 0) { return false; }
                var regex = /\s+/gi;
                var wordCount = value.trim().replace(regex, ' ').split(' ').length;

                var allowed = /[\u00C0-\u017F\u3400-\u9FBF\u0600-\u06FF]/;

                if (wordCount < 5)
                    codeStatus = -1;
                else if (allowed.test(value)) 
                    codeStatus=1;
                else if (value.indexOf('[spoiler]')>0)
                    codeStatus = 2;
                return codeStatus;
            }
        },
        cache: {
            process: function (s, event, event2) {
                var event2 = event2 || false;
                var c = s + " img";
                $.each($(c), function () {
                    if ($(this).data("src").indexOf("ms-appx")!=-1) {
                        $(this).attr("src", $(this).data("src"));
                        if(event2) event2(this);
                    }
                    else event(this);
                });
            }

        },
        coverFlow: {
            show: function () {
                $("#coverFlow").removeClass("out");
                $(".cf-viewToggler").addClass("visible");
            },
            hide: function () {
                $(".cf-viewToggler").removeClass("visible");
                $("#coverFlow").addClass("out");
            }
        }
    }
    if (!window.trakt) {
        window.trakt = trakt;
    }
})();


var simulateToast = function () {
    var now = new Date();
    var airTime = new Date(now.getTime() + 1 * 60000);
    var idNumber = Math.floor(Math.random() * 100000000);

    var toastTemplate = '<toast activationType="protocol" launch="trakt://gotoShow?showid=92187" scenario="reminder">' +
        '<visual>' +
        '<binding template="ToastGeneric">' +
        '<image placement="hero" src="https://image.tmdb.org/t/p/original/sEqHXTDUr3W6oNFFIgR5re8UQxZ.jpg"/>' +
        '<text>Riverdale is now starting on The CW</text>' +
        '<text>Chapter Twenty Two: Silent Night, Deadly Night</text>' +

        '</binding>' +
        '</visual>' +
        '<actions>' +
        '<action content="Check in" activationType="protocol" arguments="trakt://doCheckIn?traktid=92187"/>' +
        '<action content="I\'ll watch later" activationType="system" arguments="dismiss"/>' +
        '</actions>' +
        '<audio src="ms-winsoundevent:Notification.Reminder"/>' +
        '</toast>';
    console.log(toastTemplate);
    var toastDOM = Windows.Data.Xml.Dom.XmlDocument();
    toastDOM.loadXml(toastTemplate);
    var toast = new Windows.UI.Notifications.ScheduledToastNotification(toastDOM, airTime);
    toast.id = "Toast" + idNumber;
    Windows.UI.Notifications.ToastNotificationManager.createToastNotifier().addToSchedule(toast);
}


var backgroundTask = function () {
    var tmdbAPI = function () {
        var isTest = false;
        var apiKey = '';
        var baseURL = 'https://api.themoviedb.org/3';
        var imageSizes = { "fanartBig": 'original', "fanartSmall": 'w780', "posterBig": 'original', "posterSmall": 'w500', "profileBig": 'original', "profileSmall": 'h632' };
        var imageBase = (Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri'] : false;


        var endpoints = {
            'getShowImages': '/tv/{tv_id}'
        }
        var getShowImages = function (params) {
            var url = endpoints['getShowImages'];
            url = url.replace("{tv_id}", params.tmdb);
            return getInfo(url).then(function (result) {
                if (result.backdrop_path !== "")
                    return { "image": Windows.Storage.ApplicationData.current.roamingSettings.values['tmdb_imguri']+"w780"+result.backdrop_path, "id": params.id };
                else return false;
            });
        }

        var getInfo = function (url) {
            return new Promise(function (resolve, reject) {
                var modUrl = baseURL + url + '?api_key=' + apiKey + '&language=en&v=' + Date.now();
                var xhr = new XMLHttpRequest();
                xhr.open("GET", modUrl);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = function () {
                    if (this.status >= 200 && this.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        }
                        catch (ex) {
                            resolve(xhr.response);
                        }
                    } else {
                        reject({
                            status: this.status,
                            statusText: xhr.statusText
                        });
                    }
                };
                xhr.onerror = function () {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                };
                xhr.send(null);
            });
        }

        return {
            getShowImages: getShowImages
        }
    }();


    var notifications = Windows.UI.Notifications;
    var clientID = '';
    var accessToken = (Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] : false;


    /*
    * CLEAR TILE INFO
    */
    notifications.TileUpdateManager.createTileUpdaterForApplication().clear();
    notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(true);
    notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().clear();
    var scheduled = Windows.UI.Notifications.ToastNotificationManager.createToastNotifier().getScheduledToastNotifications();
    for (var i = 0; i < scheduled.length; i++) {
        Windows.UI.Notifications.ToastNotificationManager.createToastNotifier().removeFromSchedule(scheduled[i]);
    }


    if (Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] && Windows.Storage.ApplicationData.current.roamingSettings.values['trk_accesstoken'] !== "") {
        var userSettings = JSON.parse(Windows.Storage.ApplicationData.current.roamingSettings.values['trk_usersettings']);


        var userTile_xml = '<tile>' +
            '<visual branding="name">' +
            '<binding template="TileLarge" hint-textStacking="center">' +
            '<group>' +
            '<subgroup hint-weight="1"/>' +
            '<subgroup hint-weight="2">' +
            '<image src="' + userSettings.user.images.avatar.full + '" hint-crop="circle"/>' +
            '</subgroup>' +
            '<subgroup hint-weight="1"/>' +
            '</group>' +
            '<text hint-style="title" hint-align="center">Hi,</text>' +
            '<text hint-style="subtitleSubtle" hint-align="center">' + userSettings.user.username + '</text>' +
            '</binding>' +
            '</visual>' +
            '</tile>';
        var userTile_dom = Windows.Data.Xml.Dom.XmlDocument();
        userTile_dom.loadXml(userTile_xml);
        var userTile_notification = new notifications.TileNotification(userTile_dom);
        notifications.TileUpdateManager.createTileUpdaterForApplication().update(userTile_notification);


        /**
            * GET UNREAD COUNT
            */
        var towatch_raw = Array();
        var totalToWatch = 0;


        var xmlhttp2 = new XMLHttpRequest();
        xmlhttp2.onreadystatechange = function () {
            if (xmlhttp2.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp2.status === 200) {

                    var data = JSON.parse(xmlhttp2.responseText);

                    var requestTree;
                    for (var a = 0; a < data.length; a++) {
                        towatch_raw.push({ "showid": data[a].show.ids.trakt });

                        var xmlhttp3 = new XMLHttpRequest();
                        xmlhttp3.onreadystatechange = function () {

                            if (this.readyState === XMLHttpRequest.DONE) {
                                if (this.status === 200) {
                                    var data2 = JSON.parse(this.responseText);

                                    var queryString = this.responseURL;

                                    var params, queries, temp, i, l;
                                    queries = queryString.split("&");

                                    temp = queries[queries.length - 2].split('=');
                                    params = temp[1];



                                    for (var key in towatch_raw) {
                                        //console.log(params, towatch_raw[key].showid);
                                        if (params == towatch_raw[key].showid) {
                                            if (data2.completed < data2.aired) {
                                                for (var c = 0; c < data2.seasons.length; c++) {

                                                    totalToWatch += (data2.seasons[c].aired - data2.seasons[c].completed);
                                                   // console.log(totalToWatch);

                                                    var badgeType = notifications.BadgeTemplateType.badgeNumber;
                                                    var badgeXml = notifications.BadgeUpdateManager.getTemplateContent(badgeType);
                                                    var badgeAttributes = badgeXml.getElementsByTagName("badge");
                                                    badgeAttributes[0].setAttribute("value", totalToWatch);
                                                    var badgeNotification = new notifications.BadgeNotification(badgeXml);
                                                    notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badgeNotification);
                                                }
                                            }
                                        }
                                    }

                                }
                            }

                        };

                        var urltoget3 = "https://api.trakt.tv/shows/" + data[a].show.ids.slug + "/progress/watched?hidden=false&specials=false&traktid=" + data[a].show.ids.trakt + '&v=' + Date.now();
                        xmlhttp3.open("GET", urltoget3);
                        xmlhttp3.setRequestHeader('Content-Type', 'application/json');
                        xmlhttp3.setRequestHeader('trakt-api-key', clientID);
                        xmlhttp3.setRequestHeader('trakt-api-version', '2');
                        xmlhttp3.setRequestHeader('Origin', 'ms-appx://375671a2-0073-4ea1-9325-342889186509');
                        if (accessToken) {
                            xmlhttp3.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                        }
                        xmlhttp3.send(null);
                    }


                }
            }

        };
        var urltoget2 = "https://api.trakt.tv/users/" + userSettings.user.username + "/watched/shows?extended=noseasons&v=" + Date.now();
        xmlhttp2.open("GET", urltoget2);
        xmlhttp2.setRequestHeader('Content-Type', 'application/json');
        xmlhttp2.setRequestHeader('trakt-api-key', clientID);
        xmlhttp2.setRequestHeader('trakt-api-version', '2');
        xmlhttp2.setRequestHeader('Origin', 'ms-appx://375671a2-0073-4ea1-9325-342889186509');
        if (accessToken) {
            xmlhttp2.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        }
        xmlhttp2.send(null);


        /**
            * GET UPCOMING SHOWS AND TOASTS
            */
        
                var upcomingData;
        
                var startdate = new Date();
                startdate = startdate.getFullYear() + "-" + ((startdate.getMonth() < 9) ? "0" : "") + (startdate.getMonth() + 1) + "-" + ((startdate.getDate() < 10) ? "0" : "") + startdate.getDate();
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onerror = function () {
                    console.log("ups");
                };
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                        if (xmlhttp.status === 200) {
                            upcomingData = JSON.parse(xmlhttp.responseText);
                            
                            if (upcomingData.length > 0) {
                                var tilesAdded = 0;
                                for (var b = 0; b < upcomingData.length; b++) {


                          
                                    

                                    tmdbAPI.getShowImages({ "tmdb": upcomingData[b].show.ids.tmdb, "id": b }).then(function (res) {
                                        console.log(res);
                                        var data = upcomingData;
                                        var a = res.id;
                                   
                                    var newurl = res.image;

                                    if (tilesAdded < 4) {
                                        
                                        var d = new Date(data[a].first_aired);
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
                                        var completeDate;
                                        if ((secondDate.getDate() - firstDate.getDate()) === 0) { //TODAY
                                            completeDate = "Today at " + h + ":" + m + "" + dd;
                                        }
                                        else if ((secondDate.getDate() - firstDate.getDate()) === 1) {
                                            if (secondDate.getHours() >= 0 && secondDate.getHours() <= 5 || secondDate.getHours() >= 20 && secondDate.getHours() <= 23)
                                                completeDate = "Tonight at " + h + ":" + m + "" + dd;
                                            else
                                                completeDate = "Tomorrow at " + h + ":" + m + "" + dd;
                                        }
                                        else completeDate = dateMonths[d.getMonth()] + " " + d.getDate() + " at " + h + ":" + m + "" + dd;
                                        if (secondDate >= firstDate) {
                                            var showTile_xml = '<tile>' +
                                                '<visual>' +
                                                '<binding template="TileWide" displayName="' + data[a].episode.title + '"  branding="name" >' +
                                                '<image src="' + newurl + '" placement="background" hint-overlay="50" />' +
                                                '<group>' +
                                                '<subgroup>' +
                                                '<text hint-style="caption" hint-wrap="false">' + data[a].show.title + '</text>' +
                                                '<text hint-style="captionSubtle" hint-wrap="true">' + completeDate + ' on ' + data[a].show.network + '</text>' +
                                                '<text />' +
                                                '<text hint-style="captionSubtle">Season ' + data[a].episode.season + ' Episode ' + data[a].episode.number + '</text>' +
                                                '</subgroup>' +
                                                '</group>' +
                                                '</binding>' +
                                                '<binding template="TileLarge"  branding="none">' +
                                                '<image src="' + newurl + '" placement="background" hint-overlay="50"/>' +
                                                '<group>' +
                                                '<subgroup>' +
                                                '<text hint-style="base" hint-wrap="true">' + data[a].show.title + '</text>' +
                                                '<text hint-style="baseSubtle" hint-wrap="true">' + completeDate + ' on ' + data[a].show.network + '</text>' +
                                                '</subgroup>' +
                                                '</group>' +
                                                '<text />' +
                                                '<text hint-style="captionSubtle">Season ' + data[a].episode.season + ' Episode ' + data[a].episode.number + '</text>' +
                                                '<text hint-style="captionSubtle" hint-wrap="true">' + ((data[a].episode.title!=null)? data[a].episode.title:'') + '</text>' +
                                                '</binding>' +
                                                '</visual>' +
                                                '</tile>';
                                            var showTile_dom = Windows.Data.Xml.Dom.XmlDocument();
                                            showTile_dom.loadXml(showTile_xml);
                                            console.log(tilesAdded);
                                            var showTile_notification = new notifications.TileNotification(showTile_dom);
                                            notifications.TileUpdateManager.createTileUpdaterForApplication().update(showTile_notification);

                                            tilesAdded++;
                                        }
                                    }

                                    var airTime = new Date(data[a].first_aired);
                                    var curTime = new Date();
                                    if (airTime > curTime) {
                                        var idNumber = Math.floor(Math.random() * 100000000);

                                        var toastTemplate = '<toast activationType="protocol" launch="trakt://gotoShow?showid=92187" scenario="reminder">' +
                                            '<visual>' +
                                            '<binding template="ToastGeneric">' +
                                            '<image placement="hero" src="' + newurl + '"/>' +
                                            '<text>' + data[a].show.title + ' is now starting on ' + data[a].show.network + '</text>' +
                                            '<text>' + data[a].episode.title + '</text>' +

                                            '</binding>' +
                                            '</visual>' +
                                            '<actions>' +
                                            '<action content="Check in" activationType="protocol" arguments="trakt://doCheckIn?traktid=92187"/>' +
                                            '<action content="I\'ll watch later" activationType="system" arguments="dismiss"/>' +
                                            '</actions>' +
                                            '<audio src="ms-winsoundevent:Notification.Reminder"/>' +
                                            '</toast>';
                                        console.log(toastTemplate);
                                        var toastDOM = Windows.Data.Xml.Dom.XmlDocument();
                                        toastDOM.loadXml(toastTemplate);
                                        var toast = new Windows.UI.Notifications.ScheduledToastNotification(toastDOM, airTime);
                                        toast.id = "Toast" + idNumber;
                                        Windows.UI.Notifications.ToastNotificationManager.createToastNotifier().addToSchedule(toast);
                                    }


                                });
        
        
                                    //END
                                }
        
        
                            }
        
                        }
                    }
                };
                var urltoget = "https://api.trakt.tv/calendars/my/shows/" + startdate + "/" + ((Windows.Storage.ApplicationData.current.roamingSettings.values['trk_myshows_days']) ? Windows.Storage.ApplicationData.current.roamingSettings.values['trk_myshows_days'] : 14) + "?extended=full,images&v=" + Date.now();

                console.log(urltoget);
                xmlhttp.open("GET", urltoget);
                xmlhttp.setRequestHeader('Content-Type', 'application/json');
                xmlhttp.setRequestHeader('trakt-api-key', clientID);
                xmlhttp.setRequestHeader('trakt-api-version', '2');
                xmlhttp.setRequestHeader('Origin', 'ms-appx://375671a2-0073-4ea1-9325-342889186509');
                if (accessToken) {
                    xmlhttp.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                }
                xmlhttp.send(null);
        
                




    }
};