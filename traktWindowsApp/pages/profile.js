(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    WinJS.UI.Pages.define("/pages/profile.html", {
        ready: function (element, options) {
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            trakt().fanart.hide();
            $("#menubar").addClass("showback");
            $("body").removeClass().addClass("menu-profile");
            WinJS.Resources.processAll();

            var rs = Windows.Storage.ApplicationData.current.roamingSettings;
            if (rs.values['trk_usersettings'] && rs.values['trk_usersettings'] != "") {
                var userData = JSON.parse(rs.values['trk_usersettings']);
                $("#show-movie-name").text(userData.user.username + " (preview)").addClass("visible");
                $("#profile-image-img").attr("src", userData.user.images.avatar.full);

                $("#profile-username").text(userData.user.username);
                $("#profile-name").text(userData.user.name);
                $("#profile-location").text(userData.user.location);

                /*traktAPI.getUsersSettings().done(function (data) {
                });*/

                $("#upg-info").text('Sign out').off("click").on("click", function () {
                    Ornate.User.logout();
                });

            }
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
