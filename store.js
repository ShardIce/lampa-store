(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json';

    Lampa.Lang.add({
        custom_plugin_store: {
            ru: 'Магазин плагинов',
            en: 'Plugin Store',
            uk: 'Магазин плагінів'
        }
    });

    function addStoreButton() {
        try {
            if (!Lampa.Settings || !Lampa.Settings.main) return;

            var settings = Lampa.Settings.main();
            var render = settings.render();

            if (render.find('[data-component="custom_plugin_store"]').length) return;

            var field = $(
                '<div class="settings-param selector" data-component="custom_plugin_store">' +
                    '<div class="settings-param__name">' + Lampa.Lang.translate('custom_plugin_store') + '</div>' +
                    '<div class="settings-param__descr">Установка плагинов из моего каталога</div>' +
                '</div>'
            );

            render.find('[data-component="more"]').after(field);

            settings.update();
        } catch (e) {
            console.log('Custom Plugin Store add button error:', e);
        }
    }

    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name === 'main') {
            e.body.find('[data-component="custom_plugin_store"]').off('hover:enter').on('hover:enter', function () {
                Lampa.Extensions.show({
                    store: STORE_URL,
                    with_installed: true
                });
            });
        }
    });

    if (window.appready) {
        addStoreButton();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') addStoreButton();
        });
    }
})();