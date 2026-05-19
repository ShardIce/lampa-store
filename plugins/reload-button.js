/*
 * name: Reload Lampa Button
 * author: shardice
 * version: 1.3.0
 * description: Кнопка перезагрузки Lampa между аккаунтом и меню из трёх точек. Без setInterval и MutationObserver.
 */

(function () {
    'use strict';

    var COMPONENT = 'reload_lampa_button_clean';

    function addCss() {
        if ($('#reload-lampa-button-clean-style-v3').length) return;

        $('body').append('<style id="reload-lampa-button-clean-style-v3">' +
            '[data-component="' + COMPONENT + '"]{width:2.42em!important;height:2.42em!important;min-width:2.42em!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0 .42em!important;background:rgba(255,255,255,.055)!important;color:#fff!important;position:relative!important;z-index:2!important;}' +
            '[data-component="' + COMPONENT + '"] svg{width:1.32em!important;height:1.32em!important;display:block!important;opacity:.94!important;}' +
            '[data-component="' + COMPONENT + '"].focus,[data-component="' + COMPONENT + '"].hover,[data-component="' + COMPONENT + '"]:hover{background:rgba(255,255,255,.17)!important;box-shadow:0 0 0 .14em rgba(255,255,255,.18)!important;transform:scale(1.06)!important;}' +
        '</style>');
    }

    function icon() {
        return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M20 5v5h-5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M4 19v-5h5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M18.2 9A7 7 0 0 0 6.6 6.6L4 9" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M5.8 15A7 7 0 0 0 17.4 17.4L20 15" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>';
    }

    function reload() {
        try {
            if (Lampa.Noty) Lampa.Noty.show('Перезагрузка Lampa...');
        } catch (e) {}

        setTimeout(function () {
            try {
                if (Lampa.Utils && typeof Lampa.Utils.reload === 'function') {
                    Lampa.Utils.reload();
                    return;
                }
            } catch (e) {}

            try {
                window.location.reload();
            } catch (e2) {
                location.href = location.href;
            }
        }, 250);
    }

    function isAccount(el) {
        var html = (el.html() || '').toLowerCase();
        var cls = (el.attr('class') || '').toLowerCase();
        var data = ((el.attr('data-component') || '') + ' ' + (el.attr('data-action') || '')).toLowerCase();

        return html.indexOf('account') > -1 || html.indexOf('profile') > -1 || html.indexOf('user') > -1 || cls.indexOf('account') > -1 || cls.indexOf('profile') > -1 || data.indexOf('account') > -1 || data.indexOf('profile') > -1;
    }

    function isMore(el) {
        var html = (el.html() || '').toLowerCase();
        var cls = (el.attr('class') || '').toLowerCase();
        var data = ((el.attr('data-component') || '') + ' ' + (el.attr('data-action') || '')).toLowerCase();

        return html.indexOf('more') > -1 || html.indexOf('dots') > -1 || html.indexOf('ellipsis') > -1 || cls.indexOf('more') > -1 || data.indexOf('more') > -1;
    }

    function headerButtons() {
        return $('.head__actions .selector, .header__actions .selector, .head__right .selector, .header__right .selector, .head .selector, .header .selector').filter(':visible');
    }

    function createButton() {
        var btn = $('<div class="selector" data-component="' + COMPONENT + '" title="Перезагрузить Lampa">' + icon() + '</div>');
        btn.on('hover:enter click', reload);
        return btn;
    }

    function insert() {
        addCss();

        if ($('[data-component="' + COMPONENT + '"]').length) return true;

        var buttons = headerButtons();
        if (!buttons.length) return false;

        var account = $();
        var more = $();

        buttons.each(function () {
            var el = $(this);
            if (!account.length && isAccount(el)) account = el;
            if (!more.length && isMore(el)) more = el;
        });

        if (!account.length && !more.length) return false;

        var btn = createButton();

        if (account.length && more.length && account.parent()[0] === more.parent()[0]) {
            more.before(btn);
        } else if (account.length) {
            account.after(btn);
        } else if (more.length) {
            more.before(btn);
        }

        return true;
    }

    function boot() {
        /*
         * Без setInterval и без MutationObserver:
         * всего 4 лёгкие попытки, после этого плагин больше не трогает DOM.
         */
        setTimeout(insert, 500);
        setTimeout(insert, 1500);
        setTimeout(insert, 3000);
        setTimeout(insert, 5000);
    }

    if (window.appready) boot();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') boot();
        });
    }
})();
