/*
 * name: Reload Button
 * author: shardice
 * version: 1.2.0
 * description: Кнопка перезагрузки Lampa
 */

(function () {
    'use strict';

    function reload() {
        if (Lampa.Noty) Lampa.Noty.show('Перезагрузка Lampa...');

        setTimeout(function () {
            try {
                if (Lampa.Utils && typeof Lampa.Utils.reload == 'function') {
                    Lampa.Utils.reload();
                    return;
                }
            } catch (e) {}

            location.reload();
        }, 300);
    }

    function boot() {
        if (Lampa.Noty) Lampa.Noty.show('Reload Button установлен');
        window.PluginHomeReloadLampa = reload;
    }

    if (window.appready) boot();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') boot();
        });
    }
})();
