$(function() {
    $("#send").click(function(e) {
        e.preventDefault();
        var a = !1,
            r = $("#name").val(),
            s = $("#email").val(),
            l = ($("#phone").val(), $("#message").val());
        if (0 == s.length || "-1" == s.indexOf("@")) {
            var a = !0;
            $("#email").addClass("error")
        } else $("#email").removeClass("error");
        if ("" == r) {
            var a = !0;
            $("#name").addClass("error")
        } else $("#name").removeClass("error");
        if ("" == l) {
            var a = !0;
            $("#message").addClass("error")
        } else $("#message").removeClass("error");
        0 == a ? ($(".msg").fadeOut(), $("#send").attr({
            disabled: "true",
            value: "Sending"
        }), $.post("../contact.php", $("#form").serialize(), function(e) {
            "sent" == e ? ($("#send").attr({
                disabled: "true"
            }), $("#send").text("Thank you!")) : ($("#send").removeAttr("disabled"), $("#send").text("Error!"))
        })) : $(".msg").fadeIn()
    })
});