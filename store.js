/*
 * name: Дом плагинов
 * author: shardice
 * version: 4.1.0
 * description: Лёгкий магазин. Только родной экран Lampa.Extensions.show. Без кнопки перезагрузки.
 */
(function () {
    'use strict';
    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json';
    var COMPONENT = 'plugin_home_store';
    Lampa.Lang.add({
        plugin_home_store_name: {ru:'Дом плагинов', en:'Plugin Home', uk:'Дім плагінів'},
        plugin_home_store_descr: {ru:'Бесплатные плагины без подписки', en:'Free plugins without subscription', uk:'Безкоштовні плагіни без підписки'}
    });
    function icon() {
        return '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ph_store_icon_410" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00ffd0"/><stop offset="1" stop-color="#2f80ff"/></linearGradient></defs><rect x="7" y="7" width="28" height="28" rx="8" fill="url(#ph_store_icon_410)"/><path d="M14 22h14M14 17h14M14 27h9" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="29" cy="27" r="2.7" fill="#fff"/></svg>';
    }
    function css() {
        if ($('#plugin-home-store-native-style-410').length) return;
        $('body').append('<style id="plugin-home-store-native-style-410">[data-component="'+COMPONENT+'"]{display:flex!important;align-items:center!important;gap:.85em!important;min-height:4.4em!important;}[data-component="'+COMPONENT+'"] .settings-param__icon{width:1.45em!important;height:1.45em!important;min-width:1.45em!important;max-width:1.45em!important;margin:0 .72em 0 0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;flex:0 0 1.45em!important;}[data-component="'+COMPONENT+'"] .settings-param__icon svg,[data-component="'+COMPONENT+'"] svg{width:1.34em!important;height:1.34em!important;max-width:1.34em!important;max-height:1.34em!important;display:block!important;}[data-component="'+COMPONENT+'"] .settings-param__name,[data-component="'+COMPONENT+'"] .settings-param__descr{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}</style>');
    }
    function openStore() {
        try {
            if (!Lampa.Extensions || typeof Lampa.Extensions.show !== 'function') {
                if (Lampa.Noty) Lampa.Noty.show('Lampa.Extensions.show недоступен');
                return;
            }
            Lampa.Extensions.show({store: STORE_URL, with_installed: true});
        } catch (e) {
            console.log('Plugin Home open error:', e);
            if (Lampa.Noty) Lampa.Noty.show('Не удалось открыть список расширений');
        }
    }
    function addStore() {
        css();
        try {
            if (!Lampa.Settings || !Lampa.Settings.main) return;
            var main = Lampa.Settings.main();
            if (!main || typeof main.render !== 'function') return;
            var render = main.render();
            if (!render || !render.length || typeof render.find !== 'function') return;
            if (render.find('[data-component="'+COMPONENT+'"]').length) return;
            render.find('[data-component="shardice_store"]').remove();
            var field = $('<div class="settings-param selector" data-component="'+COMPONENT+'"><div class="settings-param__icon">'+icon()+'</div><div class="settings-param__body"><div class="settings-param__name">'+Lampa.Lang.translate('plugin_home_store_name')+'</div><div class="settings-param__descr">'+Lampa.Lang.translate('plugin_home_store_descr')+'</div></div></div>');
            var after = render.find('[data-component="more"], [data-component="extensions"], [data-component="plugins"]').first();
            if (after && after.length) after.after(field); else render.append(field);
            if (typeof main.update === 'function') main.update();
        } catch (e) { console.log('Plugin Home addStore error:', e); }
    }
    Lampa.Settings.listener.follow('open', function (e) {
        try { if (e.name == 'main') e.body.find('[data-component="'+COMPONENT+'"]').off('hover:enter click').on('hover:enter click', openStore); } catch (err) {}
    });
    if (window.appready) addStore(); else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') addStore(); });
})();
