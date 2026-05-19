/*
 * name: Reload Lampa Button
 * author: shardice
 * version: 1.0.0
 * description: Добавляет кнопку перезагрузки Lampa в верхнее меню
 */

(function () {
    'use strict';

    var COMPONENT = 'shardice_reload_lampa';

    function style() {
        if ($('#shardice-reload-style').length) return;

        $('body').append('<style id="shardice-reload-style">' +
            '.shardice-reload-btn{width:2.85em;height:2.85em;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-left:.55em;background:rgba(255,255,255,.06);transition:.18s;}' +
            '.shardice-reload-btn svg{width:1.55em;height:1.55em;opacity:.92;}' +
            '.shardice-reload-btn.focus,.shardice-reload-btn.hover{background:rgba(255,255,255,.16);transform:scale(1.08);box-shadow:0 0 0 .16em rgba(255,255,255,.18);}' +
            '.shardice-reload-float{position:fixed;right:13.4em;top:1.08em;z-index:9999;}' +
        '</style>');
    }

    function icon() {
        return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M20 5v5h-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M4 19v-5h5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M18.2 9A7 7 0 0 0 6.6 6.6L4 9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M5.8 15A7 7 0 0 0 17.4 17.4L20 15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>';
    }

    function reloadApp() {
        if (Lampa.Noty) Lampa.Noty.show('Перезагрузка Lampa...');

        setTimeout(function () {
            try {
                if (Lampa.Utils && typeof Lampa.Utils.reload == 'function') {
                    Lampa.Utils.reload();
                    return;
                }
            } catch (e) {}

            location.reload();
        }, 350);
    }

    function createButton(floatMode) {
        var btn = $('<div class="shardice-reload-btn selector ' + (floatMode ? 'shardice-reload-float' : '') + '" data-component="' + COMPONENT + '">' + icon() + '</div>');
        btn.on('hover:enter click', reloadApp);
        return btn;
    }

    function findHeader() {
        var selectors = ['.head__actions', '.header__actions', '.head__right', '.header__right', '.head .selector:last', '.header .selector:last'];

        for (var i = 0; i < selectors.length; i++) {
            var el = $(selectors[i]).first();

            if (el.length) {
                if (selectors[i].indexOf(':last') > -1) return el.parent();

                return el;
            }
        }

        return $();
    }

    function addButton() {
        style();

        if ($('[data-component="' + COMPONENT + '"]').length) return;

        var header = findHeader();

        if (header.length) header.append(createButton(false));
        else $('body').append(createButton(true));
    }

    function boot() {
        addButton();
        setInterval(addButton, 3000);
    }

    if (window.appready) boot();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') boot();
        });
    }
})();
