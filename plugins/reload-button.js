/*
 * name: Reload Lampa Button
 * author: shardice
 * version: 1.4.0
 * description: Кнопка перезагрузки Lampa между аккаунтом и меню из трёх точек. Увеличенный отступ и выравнивание по соседней иконке.
 */

(function () {
    'use strict';

    var COMPONENT = 'reload_lampa_button_clean';
    var reloading = false;

    function addCss() {
        if ($('#reload-lampa-button-clean-style-v4').length) return;

        $('body').append('<style id="reload-lampa-button-clean-style-v4">' +
            '[data-component="' + COMPONENT + '"]{' +
                'display:inline-flex!important;' +
                'align-items:center!important;' +
                'justify-content:center!important;' +
                'box-sizing:border-box!important;' +
                'padding:0!important;' +
                'margin-left:.55em!important;' +
                'margin-right:.55em!important;' +
                'border-radius:50%!important;' +
                'background:rgba(255,255,255,.055)!important;' +
                'color:#fff!important;' +
                'position:relative!important;' +
                'top:0!important;' +
                'left:auto!important;' +
                'right:auto!important;' +
                'bottom:auto!important;' +
                'vertical-align:middle!important;' +
                'line-height:1!important;' +
                'z-index:2!important;' +
                'transform:none!important;' +
            '}' +
            '[data-component="' + COMPONENT + '"] svg{' +
                'width:55%!important;' +
                'height:55%!important;' +
                'display:block!important;' +
                'opacity:.94!important;' +
                'flex:0 0 auto!important;' +
            '}' +
            '[data-component="' + COMPONENT + '"].focus,[data-component="' + COMPONENT + '"].hover,[data-component="' + COMPONENT + '"]:hover{' +
                'background:rgba(255,255,255,.17)!important;' +
                'box-shadow:0 0 0 .14em rgba(255,255,255,.18)!important;' +
                'transform:scale(1.04)!important;' +
            '}' +
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
        if (reloading) return;
        reloading = true;

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
        var data = (
            (el.attr('data-component') || '') + ' ' +
            (el.attr('data-action') || '') + ' ' +
            (el.attr('title') || '') + ' ' +
            (el.attr('aria-label') || '')
        ).toLowerCase();

        return html.indexOf('account') > -1 ||
            html.indexOf('profile') > -1 ||
            html.indexOf('user') > -1 ||
            html.indexOf('avatar') > -1 ||
            cls.indexOf('account') > -1 ||
            cls.indexOf('profile') > -1 ||
            cls.indexOf('user') > -1 ||
            cls.indexOf('avatar') > -1 ||
            data.indexOf('account') > -1 ||
            data.indexOf('profile') > -1 ||
            data.indexOf('user') > -1 ||
            data.indexOf('avatar') > -1;
    }

    function isMore(el) {
        var html = (el.html() || '').toLowerCase();
        var cls = (el.attr('class') || '').toLowerCase();
        var data = (
            (el.attr('data-component') || '') + ' ' +
            (el.attr('data-action') || '') + ' ' +
            (el.attr('title') || '') + ' ' +
            (el.attr('aria-label') || '')
        ).toLowerCase();

        return html.indexOf('more') > -1 ||
            html.indexOf('dots') > -1 ||
            html.indexOf('ellipsis') > -1 ||
            html.indexOf('more_vert') > -1 ||
            html.indexOf('more_horiz') > -1 ||
            cls.indexOf('more') > -1 ||
            cls.indexOf('dots') > -1 ||
            cls.indexOf('ellipsis') > -1 ||
            data.indexOf('more') > -1 ||
            data.indexOf('dots') > -1 ||
            data.indexOf('ellipsis') > -1;
    }

    function headerButtons() {
        return $('.head__actions .selector, .header__actions .selector, .head__right .selector, .header__right .selector, .head .selector, .header .selector')
            .not('[data-component="' + COMPONENT + '"]')
            .filter(':visible');
    }

    function sameParentInOrder(left, right) {
        if (!left.length || !right.length) return false;
        if (left.parent()[0] !== right.parent()[0]) return false;

        return left.parent().children().index(left) < right.parent().children().index(right);
    }

    function previousButton(buttons, target) {
        var index = buttons.index(target);
        if (index > 0) return buttons.eq(index - 1);
        return $();
    }

    function copySizeFrom(source, button) {
        var size = 0;

        try {
            var w = source.outerWidth();
            var h = source.outerHeight();
            size = Math.round(Math.max(w || 0, h || 0));
        } catch (e) {}

        /*
         * Для TV-интерфейса Lampa обычно 46-58 px.
         * Ограничиваем размер, чтобы кнопка не раздулась и не залезла на часы.
         */
        if (!size || size < 36 || size > 64) size = 48;

        button.css({
            width: size + 'px',
            height: size + 'px',
            minWidth: size + 'px',
            maxWidth: size + 'px'
        });
    }

    function createButton(reference) {
        var btn = $('<div class="selector" data-component="' + COMPONENT + '" title="Перезагрузить Lampa">' + icon() + '</div>');
        btn.on('hover:enter click', reload);

        if (reference && reference.length) copySizeFrom(reference, btn);

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

        if (!more.length) return false;
        if (!account.length || !sameParentInOrder(account, more)) account = previousButton(buttons, more);
        if (!account.length || !sameParentInOrder(account, more)) return false;

        var reference = account;
        var btn = createButton(reference);

        more.before(btn);

        /*
         * После вставки ещё раз выравниваем по высоте соседней кнопки,
         * потому что часть размеров появляется только после добавления в DOM.
         */
        setTimeout(function () {
            copySizeFrom(reference, btn);
        }, 80);

        return true;
    }

    function boot() {
        /*
         * Без setInterval и без MutationObserver:
         * четыре лёгкие попытки и всё.
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
