/*
 * name: Shardice Store
 * author: shardice
 * version: 1.0.4
 * description: Красивый каталог пользовательских плагинов для Lampa
 */

(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json?v=104';

    Lampa.Lang.add({
        shardice_store_title: {
            ru: 'Shardice Store',
            en: 'Shardice Store',
            uk: 'Shardice Store'
        },
        shardice_store_descr: {
            ru: 'Каталог плагинов, статусов и улучшений',
            en: 'Plugins, statuses and improvements catalog',
            uk: 'Каталог плагінів, статусів та покращень'
        }
    });

    function icon() {
        return '<svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">' +
            '<defs><linearGradient id="ssg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00ffd0"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs>' +
            '<rect x="4" y="4" width="34" height="34" rx="10" fill="url(#ssg)" opacity=".95"/>' +
            '<path d="M13 22l5 5 12-13" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<circle cx="31" cy="11" r="3.2" fill="#fff"/>' +
        '</svg>';
    }

    function addStoreButton() {
        if (!Lampa.Settings || !Lampa.Settings.main) return;

        var settings = Lampa.Settings.main();
        var render = settings.render();

        if (render.find('[data-component="shardice_store"]').length) return;

        var field = $(
            '<div class="settings-param selector" data-component="shardice_store">' +
                '<div class="settings-param__icon">' + icon() + '</div>' +
                '<div class="settings-param__body">' +
                    '<div class="settings-param__name">' + Lampa.Lang.translate('shardice_store_title') + '</div>' +
                    '<div class="settings-param__descr">' + Lampa.Lang.translate('shardice_store_descr') + '</div>' +
                '</div>' +
            '</div>'
        );

        var after = render.find('[data-component="more"], [data-component="extensions"], [data-component="plugins"]').first();

        if (after.length) after.after(field);
        else render.append(field);

        settings.update();
    }

    function openStore() {
        Lampa.Extensions.show({
            store: STORE_URL,
            with_installed: true
        });
    }

    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'main') {
            e.body.find('[data-component="shardice_store"]').off('hover:enter').on('hover:enter', openStore);
        }
    });

    if (window.appready) addStoreButton();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addStoreButton();
        });
    }
})();
