/*
 * name: Очистка старого магазина
 * author: shardice
 * version: 1.0.0
 * description: Удаляет старые битые версии lampa-store из localStorage
 */

(function () {
    'use strict';

    var HOST = 'shardice.github.io/lampa-store/store.js';
    var removed = 0;

    function containsStore(value) {
        return typeof value == 'string' && value.indexOf(HOST) !== -1;
    }

    function cleanObject(obj) {
        if (Array.isArray(obj)) {
            var arr = [];

            obj.forEach(function (item) {
                if (typeof item == 'string' && containsStore(item)) {
                    removed++;
                    return;
                }

                if (item && typeof item == 'object') {
                    var raw = '';

                    try { raw = JSON.stringify(item); } catch (e) {}

                    if (containsStore(raw)) {
                        removed++;
                        return;
                    }

                    arr.push(cleanObject(item));
                    return;
                }

                arr.push(item);
            });

            return arr;
        }

        if (obj && typeof obj == 'object') {
            Object.keys(obj).forEach(function (key) {
                var value = obj[key];

                if (typeof value == 'string' && containsStore(value)) {
                    delete obj[key];
                    removed++;
                    return;
                }

                if (value && typeof value == 'object') {
                    var raw = '';

                    try { raw = JSON.stringify(value); } catch (e) {}

                    if (containsStore(raw)) {
                        delete obj[key];
                        removed++;
                        return;
                    }

                    obj[key] = cleanObject(value);
                }
            });
        }

        return obj;
    }

    try {
        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);
            var value = localStorage.getItem(key);

            if (!value || value.indexOf('shardice.github.io/lampa-store') == -1) continue;

            var parsed = null;

            try {
                parsed = JSON.parse(value);
            } catch (e) {
                if (containsStore(value)) {
                    localStorage.removeItem(key);
                    removed++;
                }

                continue;
            }

            var cleaned = cleanObject(parsed);

            try {
                localStorage.setItem(key, JSON.stringify(cleaned));
            } catch (e2) {}
        }

        if (Lampa.Noty) {
            Lampa.Noty.show('Очистка старых версий: ' + removed);
        }

        setTimeout(function () {
            try {
                if (Lampa.Utils && typeof Lampa.Utils.reload == 'function') {
                    Lampa.Utils.reload();
                    return;
                }
            } catch (e) {}

            location.reload();
        }, 1200);
    } catch (err) {
        console.log('Cleanup error:', err);

        if (Lampa.Noty) Lampa.Noty.show('Ошибка очистки старого магазина');
    }
})();
