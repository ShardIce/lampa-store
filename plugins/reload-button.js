/*
 * name: Reload Lampa Button
 * author: shardice
 * version: 1.4.1
 * description: Кнопка перезагрузки Lampa между аккаунтом и меню из трёх точек. Более устойчивый поиск верхней панели без постоянного сканирования DOM.
 */

(function () {
    'use strict';

    var COMPONENT = 'reload_lampa_button_clean';
    var reloading = false;
    var inserted = false;
    var attemptsLeft = 12;
    var scheduled = false;
    var listenersBound = false;

    function addCss() {
        if ($('#reload-lampa-button-clean-style-v5').length) return;

        $('body').append('<style id="reload-lampa-button-clean-style-v5">' +
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
            cls.indexOf('person') > -1 ||
            data.indexOf('account') > -1 ||
            data.indexOf('profile') > -1 ||
            data.indexOf('user') > -1 ||
            data.indexOf('avatar') > -1 ||
            data.indexOf('person') > -1;
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
            html.indexOf('button--options') > -1 ||
            html.indexOf('data-action="more"') > -1 ||
            html.indexOf('data-action="options"') > -1 ||
            html.indexOf('⋮') > -1 ||
            html.indexOf('•••') > -1 ||
            cls.indexOf('more') > -1 ||
            cls.indexOf('menu') > -1 ||
            cls.indexOf('options') > -1 ||
            cls.indexOf('button--options') > -1 ||
            cls.indexOf('dots') > -1 ||
            cls.indexOf('ellipsis') > -1 ||
            data.indexOf('more') > -1 ||
            data.indexOf('menu') > -1 ||
            data.indexOf('options') > -1 ||
            data.indexOf('dots') > -1 ||
            data.indexOf('ellipsis') > -1;
    }

    function isClock(el) {
        var text = (el.text() || '').replace(/\s+/g, '').toLowerCase();
        var cls = (el.attr('class') || '').toLowerCase();
        var data = (
            (el.attr('data-component') || '') + ' ' +
            (el.attr('data-action') || '') + ' ' +
            (el.attr('title') || '') + ' ' +
            (el.attr('aria-label') || '')
        ).toLowerCase();

        return /^\d{1,2}:\d{2}$/.test(text) ||
            cls.indexOf('clock') > -1 ||
            cls.indexOf('time') > -1 ||
            data.indexOf('clock') > -1 ||
            data.indexOf('time') > -1;
    }

    function unique(elements) {
        var result = $();

        elements.each(function () {
            if (result.index(this) === -1) result = result.add(this);
        });

        return result;
    }

    function headerContainers() {
        var containers = $(
            '.head__actions,' +
            '.header__actions,' +
            '.head__right,' +
            '.header__right,' +
            '.head .actions,' +
            '.header .actions'
        ).filter(':visible');

        if (!containers.length) {
            $('.head .selector:visible, .header .selector:visible').each(function () {
                var parent = $(this).parent();
                if (parent.find('.selector:visible').length > 1) containers = containers.add(parent);
            });
        }

        return unique(containers);
    }

    function buttonsIn(container) {
        var raw = container.find(
            '.selector,' +
            '.button--options,' +
            '[data-action="more"],' +
            '[data-action="menu"],' +
            '[data-action="options"],' +
            '[data-component="more"],' +
            '[data-component="menu"]'
        ).add(container.children(
            '.selector,' +
            '.button--options,' +
            '[data-action="more"],' +
            '[data-action="menu"],' +
            '[data-action="options"],' +
            '[data-component="more"],' +
            '[data-component="menu"]'
        ));
        var mapped = $();

        raw.each(function () {
            var item = $(this);
            var selector = item.hasClass('selector') ? item : item.closest('.selector');

            if (selector.length && (selector[0] === container[0] || $.contains(container[0], selector[0]))) {
                mapped = mapped.add(selector);
            } else {
                mapped = mapped.add(item);
            }
        });

        return unique(mapped)
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

    function nextButton(buttons, target) {
        var index = buttons.index(target);
        if (index > -1 && index < buttons.length - 1) return buttons.eq(index + 1);
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

    function placeBefore(target, reference) {
        if (!target || !target.length || isClock(target)) return false;
        if (!reference || !reference.length || isClock(reference)) return false;
        if (!sameParentInOrder(reference, target)) return false;

        var btn = createButton(reference);
        target.before(btn);

        setTimeout(function () {
            copySizeFrom(reference, btn);
        }, 80);

        inserted = true;
        return true;
    }

    function insertInContainer(container) {
        var buttons = buttonsIn(container);
        if (!buttons.length) return false;

        var account = $();
        var more = $();

        buttons.each(function () {
            var el = $(this);
            if (!account.length && isAccount(el)) account = el;
            if (!more.length && isMore(el)) more = el;
        });

        if (more.length) {
            var reference = account.length && sameParentInOrder(account, more) ? account : previousButton(buttons, more);
            if (placeBefore(more, reference)) return true;
        }

        if (account.length) {
            var afterAccount = nextButton(buttons, account);
            if (afterAccount.length && placeBefore(afterAccount, account)) return true;
        }

        if (buttons.length >= 4) {
            var target = buttons.eq(buttons.length - 1);
            var previous = previousButton(buttons, target);

            if (placeBefore(target, previous)) return true;
        }

        return false;
    }

    function insert() {
        addCss();

        if (inserted || $('[data-component="' + COMPONENT + '"]').length) {
            inserted = true;
            return true;
        }

        var containers = headerContainers();
        var success = false;

        containers.each(function () {
            if (success) return false;
            success = insertInContainer($(this));
        });

        return success;
    }

    function scheduleAttempt(delay) {
        if (inserted || attemptsLeft <= 0 || scheduled) return;

        scheduled = true;
        setTimeout(function () {
            scheduled = false;
            if (inserted || attemptsLeft <= 0) return;

            attemptsLeft--;
            if (!insert()) scheduleAttempt(700);
        }, delay || 0);
    }

    function bindLightEvents() {
        if (listenersBound) return;
        listenersBound = true;

        try {
            if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
                Lampa.Listener.follow('app', function () {
                    scheduleAttempt(250);
                });

                Lampa.Listener.follow('activity', function () {
                    scheduleAttempt(250);
                });
            }
        } catch (e) {}

        try {
            if (Lampa.Controller && Lampa.Controller.listener && typeof Lampa.Controller.listener.follow === 'function') {
                Lampa.Controller.listener.follow('toggle', function () {
                    scheduleAttempt(250);
                });
            }
        } catch (e2) {}
    }

    function boot() {
        /*
         * Без setInterval и без MutationObserver:
         * несколько лёгких попыток, затем только редкие события Lampa,
         * пока не исчерпан небольшой лимит.
         */
        bindLightEvents();

        scheduleAttempt(300);
        setTimeout(function () { scheduleAttempt(1200); }, 1200);
        setTimeout(function () { scheduleAttempt(2600); }, 2600);
        setTimeout(function () { scheduleAttempt(5000); }, 5000);
        setTimeout(function () { scheduleAttempt(9000); }, 9000);
    }

    if (window.appready) boot();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') boot();
        });
    }
})();
