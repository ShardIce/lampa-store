/*
 * name: Shardice Clean Store
 * version: 2.0.0
 * author: shardice
 * description: Красивый каталог пользовательских плагинов для Lampa
 */
(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json?v=2';
    var COMPONENT = 'shardice_clean_store';

    function tr(key) {
        return Lampa.Lang.translate(key);
    }

    Lampa.Lang.add({
        shardice_store_title: {
            ru: 'Shardice Store',
            en: 'Shardice Store',
            uk: 'Shardice Store'
        },
        shardice_store_descr: {
            ru: 'Чистый каталог плагинов: статусы, удобство, порядок',
            en: 'Clean plugin catalog: statuses, tools, order',
            uk: 'Чистий каталог плагінів: статуси, зручність, порядок'
        }
    });

    function injectStyle() {
        if (document.getElementById('shardice-store-style')) return;

        var css = '' +
            '.settings-param[data-component="' + COMPONENT + '"]{position:relative;overflow:hidden;}' +
            '.settings-param[data-component="' + COMPONENT + '"]:before{content:"";position:absolute;right:1.2em;top:50%;width:5em;height:5em;transform:translateY(-50%);background:linear-gradient(135deg,rgba(0,255,210,.32),rgba(83,120,255,.18));border-radius:50%;filter:blur(.3em);}' +
            '.shardice-store-icon{width:2.15em;height:2.15em;margin-right:1.1em;display:flex;align-items:center;justify-content:center;border-radius:.55em;background:linear-gradient(135deg,rgba(0,255,210,.28),rgba(110,130,255,.22));box-shadow:0 0 1.2em rgba(0,255,210,.18);}' +
            '.shardice-store-icon svg{width:1.35em;height:1.35em;display:block;}' +
            '.shardice-store-meta{position:relative;z-index:1;}' +
            '.shardice-store-badge{display:inline-block;margin-left:.65em;padding:.18em .55em;border-radius:.5em;font-size:.62em;font-weight:700;background:rgba(0,255,210,.18);color:#9ffff0;vertical-align:middle;}' ;

        var style = document.createElement('style');
        style.id = 'shardice-store-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function fieldHtml() {
        return '' +
            '<div class="settings-param selector" data-component="' + COMPONENT + '">' +
                '<div class="shardice-store-icon">' +
                    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M4 8.5C4 7.12 5.12 6 6.5 6h11C18.88 6 20 7.12 20 8.5v8c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 19 4 17.88 4 16.5v-8Z" stroke="white" stroke-width="1.7"/>' +
                        '<path d="M8 6V5a4 4 0 0 1 8 0v1" stroke="white" stroke-width="1.7" stroke-linecap="round"/>' +
                        '<path d="M8 12h8M8 15h5" stroke="#9ffff0" stroke-width="1.7" stroke-linecap="round"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="shardice-store-meta">' +
                    '<div class="settings-param__name">' + tr('shardice_store_title') + '<span class="shardice-store-badge">CLEAN</span></div>' +
                    '<div class="settings-param__descr">' + tr('shardice_store_descr') + '</div>' +
                '</div>' +
            '</div>';
    }

    function addStore() {
        try {
            injectStyle();

            if (!Lampa.Settings || !Lampa.Settings.main) return;

            var main = Lampa.Settings.main();
            var render = main.render();

            if (render.find('[data-component="' + COMPONENT + '"]').length) return;

            var after = render.find('[data-component="pirate_store"]');
            if (!after.length) after = render.find('[data-component="more"]');

            if (after.length) after.after(fieldHtml());
            else render.append(fieldHtml());

            main.update();
        } catch (err) {
            console.log('Shardice Store add error:', err);
        }
    }

    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name === 'main') {
            e.body.find('[data-component="' + COMPONENT + '"]').off('hover:enter click').on('hover:enter click', function () {
                Lampa.Extensions.show({
                    store: STORE_URL,
                    with_installed: true
                });
            });
        }
    });

    if (window.appready) addStore();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') addStore();
        });
    }
})();
