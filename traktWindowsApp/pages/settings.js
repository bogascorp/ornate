(function () {
    "use strict";
    var resourceNS = Windows.ApplicationModel.Resources.Core;
    var resourceMap = resourceNS.ResourceManager.current.mainResourceMap.getSubtree('Resources');
    var context = resourceNS.ResourceContext.getForCurrentView();

    WinJS.Utilities.startLog({ type: "customType", tags: "custom" });
    WinJS.UI.Pages.define("/pages/settings.html", {

        ready: function (element, options) {
            // TODO: Initialize the page here.
            $("section a").on("click", linkClickEventHandler);
            $("header a").on("click", linkClickEventHandler);
            trakt().fanart.hide();
            $("#menubar").addClass("showback");
            $("body").removeClass().addClass("menu-tvshows");
            WinJS.Resources.processAll();
            $("#show-movie-name").text('Settings (soon)').addClass("visible");

            $("#languagepicker").off("change").on("change", function () {
                context.languages = [this.value];
                WinJS.Resources.processAll();
            });
            

            document.getElementById("settings-cachebtn").addEventListener("click", function () {
                cacherAPI.clearCacheFolder().then(function () {
                    var idNumber = Math.floor(Math.random() * 100000000);

                    var toastTemplate =
                        `<toast>
                        <visual>
                        <binding template="ToastGeneric">
                        <text>Ornate</text>
                        <text>Cache was cleared successfully.</text>
                        </binding>
                        </visual>
                        </toast>`;

                    var toastDOM = Windows.Data.Xml.Dom.XmlDocument();
                    toastDOM.loadXml(toastTemplate);

                    var toastNotif = new Windows.UI.Notifications.ToastNotification(toastDOM);
                    Windows.UI.Notifications.ToastNotificationManager.createToastNotifier().show(toastNotif);

                });
            });


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
