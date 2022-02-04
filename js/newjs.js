defaultTime = 6000
phone = true
QWechat = false
notice = []
$(document).ready(function () {
    add_tips("数据自动刷新中,请勿长期打开此页面");
    add_tips("点击ID开始学习后即可关闭网页，系统会在后台自动学习");
    phone = checkPhone()
    $("#loading").height($(document).height() * 2)
    if (phone)
        $("#qrNotice").innerText = "也可以保存到相册或者截图后，用学习强国的扫一扫"
})

function checkPhone() {
    let ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        QWechat = true
    } else if (ua.match(/QQ/i) == "qq") {
        QWechat = true
    } else {
        QWechat = false
    }
    let system = {};
    let p = navigator.platform;
    system.win = p.indexOf("Win") === 0;
    system.mac = p.indexOf("Mac") === 0;
    system.xll = (p === "X11") || (p.indexOf("Linux") === 0);
    if (system.win || system.mac || system.xll) {//如果是电脑跳转到
        return false
    } else {  //如果是手机,跳转到
        return true
    }

}

function newNotices(msg, time, type) {
// create the notification
    while (notice.length > 0) {
        notice[0].dismiss()
        notice.shift()
    }
    if (time === undefined)
        time = defaultTime
    if (type === undefined)
        type = 'notice'
    let notification = new NotificationFx({
        message: '<span class="icon icon-settings"></span><p>' + msg + '</p>',
        wrapper: document.body,
        layout: 'bar',
        effect: 'exploader',
        ttl: time,
        type: type, // notice, warning or error
    });
    notice.push(notification)
    // show the notification
    notification.show();
}

function check_now() {
    $.ajax({
        type: "GET",
        url: "/xxqg/api/now",
        dataType: "JSON",
        success: function (response) {
            closeLoading()
            $("#timestamp").text(response.data);
        },
        false: function (response) {
            closeLoading()
            $("#timestamp").text("服务器异常！请联系开发者处理。");
            newNotices("服务器异常！请联系开发者处理。", defaultTime * 1000, 'error');
            alert("服务器异常！请联系开发者处理。")
        },
    });
}

function add_user() {
    $.ajax({
        type: "GET",
        url: "/xxqg/api/add",
        dataType: "JSON",
        success: function (response) {
            closeLoading()
            add_tips(response.data);
            refresh_all_cookies()
        },
    });
}

function user_refresh_all_cookies() {
    $.ajax({
        type: "GET",
        url: "/xxqg/api/refresh_all_cookies",
        dataType: "JSON",
        success: function (response) {
            closeLoading()
            refresh_user_status(response.data);
            newNotices("用户学习状态刷新成功！");
        },
    });
}

function get_app_jump_url(url) {
    if (url.indexOf('/') != -1) {
        url = encodeURIComponent(url);
    }
    return 'dtxuexi://appclient/page/study_feeds?url=' + url;
    // newNotices("尝试打开学习强国app进行登录。如果打不开请使用扫码登录！");

}

function refresh_msg(messages) {
    messages = to_arr(messages);
    $("#message tr:first").nextAll().remove();
    for (const message of messages) {
        if (-1 != message.text.indexOf("login.xuexi.cn")) {
            $("#message table tr:first").after(
                "<tr>" +
                "<td>" +
                "<span>" +
                // message.timestamp +
                moment(message.timestamp).format('a h:mm:ss') +
                "</span>" +
                "</td>" +
                "<td>" +
                '<button style="width: 160px">' +
                '<a target="_blank" onclick="Do(this,' + "'makeLoginJump'" + ')"  style="text-align: center;color: red;">' +
                '💠👉🏻点这里登录' + "<br>" + '五分钟内有效👈️💠' +
                '<a style="display:none" href="' +
                get_app_jump_url(message.text) +
                '"' + "></a>" +
                "</a>" +
                '</button>' +
                "</td>" +
                "</tr>"
            );
        } else {
            let mes = message.text
            if (mes === "\u8bf7\u767b\u5f55\uff08\u767b\u5f55\u65b9\u5f0f\u8bf7\u4ed4\u7ec6\u9605\u8bfb\u6587\u6863\uff0c\u5982\u679c\u89c9\u5f97\u8fd9\u662f\u8ba9\u4f60\u4e0b\u8f7d\uff0c\u5c31\u662f\u4f60\u6ca1\u4ed4\u7ec6\u8bfb\u6587\u6863\uff09\uff1a")
                mes = "\u8bf7\u767b\u5f55"
            else if(mes === "\"ヾ(o◕∀◕)ﾉヾ☆登录成功，手动点击UID开始学习★ヾ(≧O≦)〃嗷~\"")
                mes = "登录成功，点击你的ID开始自动学习哦嗷~"
            $("#message table tr:first").after(
                "<tr>" +
                "<td>" +
                "<span>" +
                // message.timestamp +
                moment(message.timestamp).format('a h:mm:ss') +
                "</span>" +
                "</td>" +
                "<td>" +
                "<span>" +
                mes +
                "</span>" +
                "</td>" +
                "</tr>"
            );
        }
    }
}

function openLoading() {
    /**
     * 禁用滚动条
     */
    function unScroll() {
        var top = $(document).scrollTop();
        $(document).on('scroll.unable', function (e) {
            $(document).scrollTop(top);
        })
    }

    $("#loading").fadeIn();
    unScroll()
    $(".loader").css("top", 0.5 * $(window).height() + $(document).scrollTop())
}

function closeLoading() {
    $("#loading").fadeOut();
    $(document).unbind("scroll.unable");
}

function Do(self, id) {
    const idCode = ['makeLogin', 'makeFresh', 'makeLoginJump', 'makeLogout','makeLearn']
    openLoading()
    switch (id) {
        case idCode[0]:
            add_user()
            newNotices("请求登录中！稍后请点击下方消息区域的登录按钮或者扫码登录！", defaultTime, 'warning');
            break
        case idCode[1]:
            list_users_status()
            user_refresh_all_cookies()
            newNotices("数据刷新中！", defaultTime, 'warning')
            break
        case idCode[2]:
            if (phone) {
                if (!QWechat) {
                    newNotices("尝试打开学习强国app进行登录。如果打不开或者打开空白请多试几次，还不行就使用下面的扫码登录！");
                    alert("尝试打开学习强国app进行登录。如果打不开或者打开空白请多试几次，还不行就使用下面的扫码登录！")
                    window.location.href = self.parentElement.children[1].href
                }
                else{
                    newNotices("请在浏览器中打开才能进行跳转，否则请使用二维码登录！")
                    alert("请在浏览器中打开才能进行跳转，否则请使用二维码登录！")
                }
            } else {
                newNotices("电脑请使用扫码登录！", defaultTime, 'error')
            }
            break
        case idCode[3]:
            newNotices("退出成功！系统已退出账号，即将刷新",defaultTime,"warning");
            setTimeout(function () {
                location.reload();
            },6000)
            break
        case idCode[4]:
            learn(self)
            newNotices("已经向服务器提交学习请求，正在后台学习，预计需要15-20分钟，此网页可以关闭")
            alert("已经向服务器提交学习请求，正在后台学习，预计需要15-20分钟，此网页可以关闭");
            break
    }
}