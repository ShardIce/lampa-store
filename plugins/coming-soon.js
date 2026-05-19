/*
 * name: Очистка интерфейса
 * author: shardice
 * version: 0.1.0
 * description: Заглушка будущего плагина
 */

(function () {
    'use strict';

    function ready() {
        if (Lampa.Noty) Lampa.Noty.show('Плагин пока в разработке');
    }

    if (window.appready) ready();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') ready();
        });
    }
})();
