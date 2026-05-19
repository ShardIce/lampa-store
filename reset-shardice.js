/*
 * name: Shardice Reset
 * author: shardice
 * version: 3.0.0
 * description: Удаляет старые версии магазина, Radio Record и Reload Button из localStorage и DOM.
 */
(function () {
    'use strict';
    var NEEDLES = ['shardice.github.io/lampa-store','plugin_home_reload','plugin-home-reload','record_radio_plugin','record-radio-plugin','plugin_home_store_','plugin-home__scroll','plugin-card','colStep','Reload Button','Radio Record'];
    var removed = 0;
    function hasNeedle(text) {
        if (typeof text !== 'string') return false;
        for (var i = 0; i < NEEDLES.length; i++) if (text.indexOf(NEEDLES[i]) !== -1) return true;
        return false;
    }
    function clean(value) {
        if (Array.isArray(value)) {
            var out = [];
            value.forEach(function (item) {
                var raw = '';
                try { raw = typeof item === 'string' ? item : JSON.stringify(item); } catch (e) {}
                if (hasNeedle(raw)) { removed++; return; }
                out.push(item && typeof item === 'object' ? clean(item) : item);
            });
            return out;
        }
        if (value && typeof value === 'object') {
            Object.keys(value).forEach(function (key) {
                var raw = '';
                try { raw = typeof value[key] === 'string' ? value[key] : JSON.stringify(value[key]); } catch (e) {}
                if (hasNeedle(raw) || hasNeedle(key)) { delete value[key]; removed++; return; }
                if (value[key] && typeof value[key] === 'object') value[key] = clean(value[key]);
            });
        }
        return value;
    }
    function cleanStorage(storage) {
        for (var i = storage.length - 1; i >= 0; i--) {
            var key = storage.key(i);
            var value = storage.getItem(key);
            if (!hasNeedle(key) && !hasNeedle(value)) continue;
            try { storage.setItem(key, JSON.stringify(clean(JSON.parse(value)))); }
            catch (e) { storage.removeItem(key); removed++; }
        }
    }
    try { cleanStorage(localStorage); cleanStorage(sessionStorage); } catch (e) { console.log('Shardice Reset storage error:', e); }
    try { $('[data-component*="plugin_home_reload"], [data-component*="record_radio"], .plugin-home-reload, .plugin-home-reload-v2, .record-radio-menu-item').remove(); } catch (e2) {}
    try {
        if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
            ['extensions','plugins','plugins_installed','extensions_installed'].forEach(function (key) {
                try {
                    var value = Lampa.Storage.get(key);
                    if (!value) return;
                    var raw = JSON.stringify(value);
                    if (hasNeedle(raw)) { Lampa.Storage.set(key, clean(value)); removed++; }
                } catch (e3) {}
            });
        }
    } catch (e4) {}
    if (Lampa.Noty) Lampa.Noty.show('Очистка старых плагинов: ' + removed);
    setTimeout(function () {
        try { if (Lampa.Utils && typeof Lampa.Utils.reload === 'function') { Lampa.Utils.reload(); return; } } catch (e5) {}
        location.reload();
    }, 1500);
})();
