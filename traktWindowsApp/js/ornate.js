var Ornate = {};
Ornate.currentShow = null;
Ornate.currentMovie = null;
Ornate.currentPerson = null;
Ornate.currentSeason = null;
Ornate.currentEpisode = null;
Ornate.Panels = {
    createPersonPanel: ($container, $data) => {
        if ($data.length > 15) {
            $($container).addClass("hasmore");
            jQuery($container).width(768);
        } else {
            $($container).removeClass("hasmore");
            if (jQuery(window).height() > 900) {
                jQuery($container).width((jQuery($container).find(".item").outerWidth(true) * Math.ceil(jQuery($container).find(".item").length / 4)) + 72 );
            } else {
                jQuery($container).width((jQuery($container).find(".item").outerWidth(true) * Math.ceil(jQuery($container).find(".item").length / 3)) + 72 );
            }
        }

        for (var b = 0; b < $data.length; b++) {
            var tile = Ornate.Tiles.Templates.personTile({
                id: "sc-" + $data[b].person.ids.trakt,
                trakt: $data[b].person.ids.trakt,
                tvdb: $data[b].person.ids.tvdb,
                tmdb: $data[b].person.ids.tmdb,
                name: $data[b].person.name,
                character: $data[b].character
            });
            jQuery($container).append(tile);
        }
        
        jQuery.each($($container).find("img"), function (index) {
            cacherAPI.preCache(this, index, 2);
        });
        Ornate.Tiles.addEvents();
        appProgress.hide();
    }
};
Ornate.Tiles = {
    Templates: {
        personTile: ($tile) => {
            return `<button id="${$tile.id}-item" class="item" data-personid="${$tile.trakt}"><div class="image"><div class="placeholder"></div><img id="${$tile.id}-img" unselectable="on" data-imgid="actor-${$tile.trakt}" data-imgtype="actorsmall" data-tmdb="${$tile.tmdb}" data-tvdb="${$tile.tvdb}"></div><span>${$tile.character}</span><strong title="${$tile.name}"><i>played by</i> ${$tile.name}</strong></button>`;
        },
        showTile: ($tile) => {
            return `<button id="${$tile.id}-item" class="item" data-showid="${$tile.trakt}"><div class="image"><div class="placeholder"></div><img id="${$tile.id}-img" unselectable="on" data-imgid="show-postersmall-${$tile.trakt}" data-imgtype="showpostersmall" data-tvdb="${$tile.tvdb}" data-tmdb="${$tile.tmdb}"  /></div><span>${$tile.title}</span></button>`;
        },
        movieTile: ($tile) => {
            return `<button id="${$tile.id}-item" class="item" data-movieid="${$tile.trakt}"><div class="image"><div class="placeholder"></div><img id="${$tile.id}-img" unselectable="on" data-imgid="movie-postersmall-${$tile.trakt}" data-imgtype="moviepostersmall" data-tmdb="${$tile.tmdb}"  /></div><span>${$tile.title}</span></button>`;
        },
        seasonTile: ($tile) => {
            return `<button id="${$tile.id}-item" class="item" data-season="${$tile.season}" data-showid="${$tile.show.trakt}" data-tmdb="${$tile.show.tmdb}" data-tvdb="${$tile.show.tvdb}"><div class="image"><div class="placeholder"></div><img id="${$tile.id}-img" unselectable="on" data-imgid="show-${$tile.show.trakt}-seasonpostersmall-${$tile.season}" data-imgtype="seasonpostersmall" data-tmdb="${$tile.show.tmdb}" data-tvdb="${$tile.show.tvdb}" data-season="${$tile.season}" /></div><span>Season ${$tile.season}</span></button>`;
        },
        episodeTile: ($tile) => {
            return `<button id="${$tile.id}-item" data-showname="${$tile.showName}" data-showid="${$tile.show.trakt}" data-season="${$tile.season}" data-episode="${$tile.episode}" class="episode-${$tile.trakt} item" data-tmdb="${$tile.show.tmdb}"><img id="${$tile.id}-img" unselectable="on" data-imgid="episode-screenshotbig-${$tile.trakt}" data-imgtype="screenshotbig" data-tvdb="${$tile.show.tvdb}" data-tmdb="${$tile.show.tmdb}" data-season="${$tile.season}"  data-episode="${$tile.episode}" /><div class="image"><div class="showname">${$tile.caption}</div><div class="airdate">${$tile.captionSmall}</div><div class="episodename"><div class="episode">${$tile.label}</div>${$tile.labelSmall}</div></div></button>`;
        },
        episodeTileAlt: ($tile) => {
            return `<button class="item alt" data-showname="${$tile.showName}" data-showid="${$tile.show.trakt}" data-season="${$tile.season}" data-episode="${$tile.episode}" data-tmdb="${$tile.show.tmdb}"><img id="${$tile.id}-img" unselectable="on" data-imgid="episode-screenshotbig-${$tile.trakt}" data-imgtype="screenshotbig" data-tvdb="${$tile.show.tvdb}" data-tmdb="${$tile.show.tmdb}" data-season="${$tile.season}"  data-episode="${$tile.episode}" /><div class="image"><div class="description">${$tile.label}</div><div class="episodename"><div class="episode">${$tile.caption}</div>${$tile.captionSmall}</div></div></button>`;
        }
    },
    addEvents: () => {
        jQuery(".person-tiles .item").off("click").on("click", function () {
            traktvHandlers.gotoPerson(this.dataset.personid);
        });

        jQuery(".season-tiles .item").off("click").on("click", function () {
            traktvHandlers.gotoSeason({
                trakt: this.dataset.showid,
                tmdb: this.dataset.tmdb,
                tvdb: this.dataset.tvdb,
                season: this.dataset.season
            });
        });

        jQuery(window).off("resize").on("resize", function () {
            if ($(".person-tiles").hasClass("expand")) {
                if (jQuery(window).height() > 900) {
                    jQuery(".person-tiles").css({ width: (jQuery(".person-tiles").find(".item").outerWidth(true) * Math.ceil(jQuery(".person-tiles").find(".item").length / 4)) + 64 });
                } else {
                    jQuery(".person-tiles").css({ width: (jQuery(".person-tiles").find(".item").outerWidth(true) * Math.ceil(jQuery(".person-tiles").find(".item").length / 3)) + 64 });
                }
            } else {
                $(".person-tiles").width(768);
            }

            jQuery(".season-tiles").css({ "width": (jQuery(".season-tiles .item").outerWidth(true) * Math.ceil(jQuery(".season-tiles .item").length / 2)) });
        });
        jQuery("#person-tiles-expand").off("click").on("click", function () {
            $(".person-tiles").toggleClass("expand");

            if ($(".person-tiles").hasClass("expand")) {
                if ($(window).height() > 900)
                    $(".person-tiles").width(($(".person-tiles .item").outerWidth(true) * Math.ceil($(".person-tiles .item").length / 4)));
                else
                    $(".person-tiles").width(($(".person-tiles .item").outerWidth(true) * Math.ceil($(".person-tiles .item").length / 3)));
            } else {
                $(".person-tiles").width(768);
            }
        });
    }
};
Ornate.Events = {
    gotoPerson: ($personid) => {
        cacherAPI.clearQueue().then(function () {
            jQuery("section").css({ opacity: 0, transform: "scale(1.1) translateY(20%)" });
            setTimeout(function () {
                WinJS.Navigation.navigate("/pages/person.html", { personid: $personid });
            }, 400);
            appProgress.show();
        });

    }
}
Ornate.User = {
    logout: () => {
        Windows.Storage.ApplicationData.current.roamingSettings.values.remove('trk_accesstoken');
        Windows.Storage.ApplicationData.current.roamingSettings.values.remove('trk_refreshtoken');
        Windows.Storage.ApplicationData.current.roamingSettings.values.remove('trk_usersettings');

        WinJS.Navigation.navigate("/pages/home.html");

        $("#upg-profile").attr("src", "/assets/noavatar.png");
        $(".menubar-profile").text('Sign in').off("click").on("click", function (e) {
            e.preventDefault();
            doLogin();
        });
    }
}