! function(t) {
    "use strict";

    function o() {
        t(".vcenter").each(function() {
            var o = t(this),
                i = t(this).parent(),
                a = i.height(),
                n = o.height(),
                e = (a - n) / 2;
            o.css(t(window).width() > 620 ? {
                "padding-top": e + "px"
            } : {
                "padding-top": "0"
            })
        })
    } {
        var i = t("#grid");
        t(".jumbotron")
    }
    t(window).load(function() {
        i.isotope(), setTimeout(function() {
            i.isotope()
        }, 100), setTimeout(function() {
            o()
        }, 500), t(".animated").addClass("start-animation"), t(".item").waypoint(function() {
            t(this).addClass("visible"), i.isotope()
        }, {
            offset: "70%"
        }), t(".fadeIn").waypoint(function() {
            t(this).addClass("visible")
        }, {
            offset: "70%"
        })
    }), t(window).resize(function() {
        i.isotope(), o()
    });
    var a = t('<div class="back-to-top"></div>');
    t("body").append(a), t("body").on("tap", ".back-to-top", function(o) {
        t("html,body").animate({
            scrollTop: 0
        }, 800, "easeInOutExpo"), o.preventDefault()
    }), t(window).scroll(function() {
        {
            var o = t(window).scrollTop();
            (100 - o / t(window).height() * 100) / 100
        }
        o > 200 ? a.addClass("active") : a.removeClass("active")
    }), t("body").on("click", "a.transition", function(o) {
        o.stopPropagation(), o.preventDefault();
        var i = t(this).attr("href");
        t(".container-fluid").removeClass("loaded"), setTimeout(function() {
            window.location = i
        }, 500)
    }), t("body").on("click", "a.anchor", function(o) {
        o.stopPropagation();
        var i = t(this).attr("href");
        t("html,body").animate({
            scrollTop: t(i).offset().top - 60 + "px"
        }, 800, "easeInOutExpo"), t("nav#main").slideUp(300), t(".menu-trigger").removeClass("active"), o.preventDefault()
    }), t("body").on("click", "a", function(o) {
        "#" == t(this).attr("href") && (o.stopPropagation(), o.preventDefault())
    }), t("body").on("click", ".menu-trigger", function(o) {
        o.stopPropagation(), t("header").hasClass("affix") ? t("nav#main").slideToggle(200) : t("nav#main").fadeToggle(500), t(this).toggleClass("active")
    }), t("body").on("click", "nav#main", function() {
        t("nav#main").slideUp(300), t(".menu-trigger").removeClass("active")
    }), t("html").on("click", "body", function() {
        t("nav#main").slideUp(300), t(".menu-trigger").removeClass("active")
    }), t("body.bottom-nav header").affix({
        offset: {
            top: function() {
                return t(window).height() - 120
            }
        }
    }), t("body.top-nav header").affix({
        offset: {
            top: 0
        }
    }), t("body.top-nav header").on("affix.bs.affix", function() {
        t("body").addClass("affixed")
    }), t("body.top-nav header").on("affix-top.bs.affix", function() {
        t("body").removeClass("affixed")
    }), t(".filter-trigger").on("tap", function() {
        t(".filters").toggleClass("active")
    }), t(".filters").on("tap", "button", function(o) {
        o.stopPropagation();
        var a = t(this).attr("data-filter");
        i.isotope({
            filter: a
        }), t(".item").addClass("visible"), o.preventDefault()
    });
    var n = 60;
    t(".filter-container").hasClass("stick") && (n = 160), t(".filter-container").affix({
        offset: {
            top: function() {
                return t(".filter-container").parent().offset().top - n
            }
        }
    })
}(jQuery);