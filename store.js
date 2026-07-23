/*
 * name: Plugin Hub
 * author: shardice
 * version: 1.5.9
 * description: Красивый каталог плагинов для Lampa. Установка и управление плагинами происходят внутри магазина.
 */

(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json';
    var COMPONENT = 'home_plugins_store_clean';
    var CONTROLLER = 'home_plugins_store_screen_clean';
    var active = null;
    var focusIndex = 0;
    var keyBound = false;
    var controllerAdded = false;
    var ignoreOpenUntil = 0;
    var installing = {};
    var actionPanel = null;
    var actionIndex = 0;
    var actionContext = null;
    var lastMoveDirection = '';
    var ignoreActionMenuUntil = {};

    Lampa.Lang.add({
        home_plugins_store_title: {
            ru: 'Plugin Hub',
            en: 'Plugin Hub',
            uk: 'Plugin Hub'
        },
        home_plugins_store_descr: {
            ru: '',
            en: '',
            uk: ''
        }
    });

    function smallIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">' +
            '<g stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">' +
                '<rect x="47" y="47" width="34" height="34" rx="9"/>' +
                '<rect x="14" y="14" width="30" height="30" rx="7"/>' +
                '<rect x="84" y="14" width="30" height="30" rx="7"/>' +
                '<rect x="14" y="84" width="30" height="30" rx="7"/>' +
                '<path d="M44 44L52 52"/>' +
                '<path d="M84 44L76 52"/>' +
                '<path d="M44 84L52 76"/>' +
                '<path d="M88 99H119"/>' +
                '<path d="M103.5 83.5V114.5"/>' +
            '</g>' +
        '</svg>';
    }

    function addCss() {
        if ($('#home-plugins-store-style-clean-v17').length) return;
        $('#home-plugins-store-style-clean-v16').remove();
        $('#home-plugins-store-style-clean-v15').remove();
        $('#home-plugins-store-style-clean-v14').remove();
        $('#home-plugins-store-style-clean-v13').remove();
        $('#home-plugins-store-style-clean-v12').remove();
        $('#home-plugins-store-style-clean-v11').remove();
        $('#home-plugins-store-style-clean-v10').remove();
        $('#home-plugins-store-style-clean-v9').remove();
        $('#home-plugins-store-style-clean-v8').remove();
        $('#home-plugins-store-style-clean-v7').remove();

        $('body').append('<style id="home-plugins-store-style-clean-v17">' +
            '[data-component="' + COMPONENT + '"]{display:flex!important;align-items:center!important;gap:.72em!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__icon{color:#fff!important;background:transparent!important;border-radius:0!important;display:flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;margin-right:.72em!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__icon svg,[data-component="' + COMPONENT + '"] .settings-param__icon svg *{max-width:100%;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__icon svg{width:2.28em!important;height:2.28em!important;display:block!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__body{min-width:0!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__name{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__descr{display:none!important;}' +

            '.hps-screen{position:fixed;left:0;top:0;right:0;bottom:0;z-index:999999;background:#202121;color:#fff;padding:1.1em 0 0 0;box-sizing:border-box;overflow:hidden;}' +
            '.hps-head{height:2.15em;display:flex;align-items:flex-start;justify-content:space-between;padding:0 1.45em;margin-bottom:.2em;box-sizing:border-box;}' +
            '.hps-brand{display:flex;align-items:center;gap:.65em;min-width:0;}' +
            '.hps-logo{display:none;}' +
            '.hps-title{font-size:1.05em;font-weight:900;line-height:1.1;white-space:nowrap;letter-spacing:0;}' +
            '.hps-subtitle{display:none;}' +
            '.hps-actions{display:flex;align-items:center;gap:.7em;flex-shrink:0;}' +
            '.hps-topbtn{padding:.38em .65em;border-radius:.42em;background:rgba(255,255,255,.08);border:0;font-weight:800;font-size:.78em;white-space:nowrap;color:rgba(255,255,255,.78);}' +
            '.hps-scroll{height:calc(100% - 2.35em);overflow-y:auto;overflow-x:hidden;padding:0 0 4em 0;box-sizing:border-box;scroll-behavior:auto;overscroll-behavior:contain;}' +
            '.hps-section{position:relative;margin:0 0 1.2em 0;}' +
            '.hps-section:before{content:"‹";position:absolute;left:0;top:1.8em;bottom:.45em;width:3.7em;display:flex;align-items:center;justify-content:flex-start;padding-left:.8em;box-sizing:border-box;font-size:2.1em;font-weight:300;color:rgba(255,255,255,.42);pointer-events:none;background:linear-gradient(270deg,rgba(32,33,33,0),#202121 76%);z-index:2;}' +
            '.hps-section:after{content:"›";position:absolute;right:0;top:1.8em;bottom:.45em;width:3.7em;display:flex;align-items:center;justify-content:flex-end;padding-right:.8em;box-sizing:border-box;font-size:2.1em;font-weight:300;color:rgba(255,255,255,.42);pointer-events:none;background:linear-gradient(90deg,rgba(32,33,33,0),#202121 76%);}' +
            '.hps-section--start:before{display:none;}' +
            '.hps-section--end:after{display:none;}' +
            '.hps-section-title{font-size:.95em;font-weight:900;margin:0 0 .5em 0;padding:0 1.45em;color:rgba(255,255,255,.92);}' +
            '.hps-grid{display:flex;gap:.66em;overflow-x:auto;overflow-y:hidden;padding:0 1.45em .55em 1.45em;box-sizing:border-box;scroll-behavior:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x pan-y;}' +
            '.hps-grid::-webkit-scrollbar,.hps-scroll::-webkit-scrollbar{width:.45em;height:.45em;}' +
            '.hps-grid::-webkit-scrollbar-track{background:rgba(255,255,255,.05);border-radius:1em;margin:0 1.8em;}' +
            '.hps-grid::-webkit-scrollbar-thumb,.hps-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.30);border-radius:1em;}' +
            '.hps-card{position:relative;flex:0 0 16.4em;min-height:10.55em;border-radius:.5em;background:#343636;border:0;box-shadow:none;overflow:hidden;padding:.72em .72em 2.75em .72em;box-sizing:border-box;}' +
            '.hps-card:before{content:"";position:absolute;left:0;right:0;top:0;height:.24em;z-index:1;pointer-events:none;background:rgba(255,255,255,.16);}' +
            '.hps-card--own{background:linear-gradient(180deg,rgba(44,68,65,.68),#343636 42%);}' +
            '.hps-card--external{background:linear-gradient(180deg,rgba(65,60,52,.58),#343636 42%);}' +
            '.hps-card--own:before{background:rgba(112,214,178,.70);}' +
            '.hps-card--external:before{background:rgba(214,186,128,.58);}' +
            '.hps-card--cover{min-height:11.85em;}' +
            '.hps-cover{height:0;border-radius:.45em;background:transparent;overflow:hidden;box-shadow:none;margin:0;}' +
            '.hps-card--cover .hps-cover{height:5.95em;margin:-.72em -.72em .62em -.72em;border-radius:.5em .5em 0 0;background:#2c2c2c;}' +
            '.hps-cover img{display:block;width:100%;height:100%;object-fit:cover;}' +
            '.hps-name{margin-top:0;font-size:.9em;font-weight:900;line-height:1.12;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-desc{margin-top:.38em;max-height:2.55em;color:rgba(255,255,255,.76);font-size:.66em;font-weight:400;line-height:1.28;overflow:hidden;}' +
            '.hps-meta{position:absolute;left:.72em;right:6.75em;bottom:.76em;color:rgba(255,255,255,.42);font-size:.62em;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-status{position:absolute;left:.72em;right:.72em;bottom:2.42em;display:flex;align-items:center;gap:.38em;min-height:1.22em;overflow:hidden;}' +
            '.hps-card--cover .hps-status{top:.48em;bottom:auto;left:.55em;right:.55em;z-index:2;}' +
            '.hps-state{height:1.32em;padding:0 .48em;border-radius:.32em;background:rgba(255,255,255,.08);font-size:.6em;font-weight:900;line-height:1;display:flex;align-items:center;white-space:nowrap;}' +
            '.hps-runtime{min-width:0;color:rgba(255,255,255,.58);font-size:.62em;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-card--ready .hps-state{background:rgba(126,224,95,.18);color:#aef08e;}' +
            '.hps-card--loaded .hps-state{background:rgba(112,214,178,.18);color:#8ee8c7;}' +
            '.hps-card--pending .hps-state{background:rgba(255,221,128,.16);color:#f1d384;}' +
            '.hps-card--error .hps-state{background:rgba(255,111,111,.16);color:#ffb0b0;}' +
            '.hps-card--disabled .hps-state{background:rgba(255,255,255,.08);color:rgba(255,255,255,.62);}' +
            '.hps-card-footer{position:absolute;right:.72em;bottom:.54em;display:flex;align-items:center;justify-content:flex-end;}' +
            '.hps-install{height:1.65em;padding:0 .68em;border-radius:.35em;background:#7ee05f;color:#101510;font-size:.66em;font-weight:900;display:flex;align-items:center;justify-content:center;min-width:5.55em;box-shadow:none;}' +
            '.hps-card--installed .hps-install{background:rgba(255,255,255,.11);color:rgba(255,255,255,.62);}' +
            '.hps-card--installing .hps-install{background:rgba(255,255,255,.14);color:#fff;box-shadow:none;}' +
            '.hps-card--disabled .hps-install{background:rgba(255,255,255,.09);color:rgba(255,255,255,.58);box-shadow:none;}' +
            '.hps-empty{margin:0 1.45em;padding:1.4em;border-radius:.55em;background:#343636;font-weight:850;color:rgba(255,255,255,.72);}' +
            '.hps-action-shade{position:absolute;z-index:8;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,.34);display:flex;justify-content:flex-end;}' +
            '.hps-action-panel{width:28em;max-width:42vw;height:100%;background:rgba(31,34,38,.98);box-shadow:-1.4em 0 2.4em rgba(0,0,0,.28);padding:1.5em 0;box-sizing:border-box;}' +
            '.hps-action-title{font-size:1.65em;font-weight:800;margin:0 1.1em .8em;line-height:1.1;}' +
            '.hps-action-plugin{margin:-.55em 1.95em .85em;color:rgba(255,255,255,.48);font-size:.82em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-action-summary{margin:0 1.6em 1em;padding:.75em .8em;border-radius:.45em;background:rgba(255,255,255,.06);display:flex;align-items:center;gap:.55em;min-width:0;}' +
            '.hps-action-summary-state{font-size:.68em;font-weight:900;color:#8ee8c7;white-space:nowrap;}' +
            '.hps-action-summary-text{font-size:.74em;font-weight:750;color:rgba(255,255,255,.62);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-action-item{font-size:1.05em;font-weight:800;padding:.78em 1.65em;min-height:2.65em;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:1em;color:#fff;}' +
            '.hps-action-item.focus{background:rgba(255,255,255,.10);box-shadow:none!important;transform:none!important;border-color:transparent!important;}' +
            '.hps-action-item--disabled{opacity:.36;pointer-events:none;}' +
            '.hps-action-item--danger{color:#ffb3b3;}' +
            '.hps-action-item-status{font-size:.7em;font-weight:800;color:rgba(255,255,255,.58);white-space:nowrap;}' +
            '.hps-screen .selector.focus,.hps-screen .selector.hover{box-shadow:0 0 0 .18em rgba(255,255,255,.78)!important;transform:none!important;}' +
            '@media(max-width:1280px){.hps-card{flex-basis:15.3em}.hps-card--cover .hps-cover{height:5.45em}.hps-screen{padding-top:1em}.hps-meta{right:6.55em}.hps-action-panel{max-width:52vw}}' +
            '@media(max-width:760px){.hps-head{padding:0 1em}.hps-section-title{padding:0 1em}.hps-grid{padding-left:1em;padding-right:1em}.hps-card{flex-basis:14.35em;min-height:10.15em}.hps-card--cover .hps-cover{height:5.1em}.hps-desc{font-size:.64em;max-height:2.45em}.hps-section:before,.hps-section:after{width:2.7em}.hps-action-panel{width:100%;max-width:100vw}}' +
        '</style>');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function stopEvent(e) {
        if (!e) return;
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    }

    function normalize(item) {
        var author = item.author || '@lampa';

        return {
            name: item.name || item.title || 'Без названия',
            descr: item.descr || item.description || '',
            version: item.version || '1.0.0',
            author: author,
            cover: item.cover || item.img || item.image || '',
            store: item.store || '',
            url: item.link || item.url || '',
            own: item.owner == 'home' || item.origin == 'home' || /@shardice/i.test(author)
        };
    }

    function originClass(plugin) {
        return plugin.own ? ' hps-card--own' : ' hps-card--external';
    }

    function load(done) {
        var url = STORE_URL + '?_=' + Date.now();

        function parse(data) {
            var sections = [];

            if (data && Array.isArray(data.results)) {
                data.results.forEach(function (section) {
                    var raw = Array.isArray(section.results) ? section.results : [];
                    var items = raw.map(normalize).filter(function (item) {
                        return !!(item.store || item.url);
                    });

                    if (items.length) {
                        sections.push({ title: section.title || 'Плагины', items: items });
                    }
                });
            }

            done(sections);
        }

        function fail(e) {
            console.log('Store load error:', e);
            done([]);
        }

        if (window.fetch) {
            fetch(url)
                .then(function (r) { return r.json(); })
                .then(parse)
                .catch(fail);
        } else if (window.$ && $.getJSON) {
            $.getJSON(url, parse).fail(fail);
        } else {
            fail('fetch is not available');
        }
    }

    function returnToSettings(delay) {
        setTimeout(function () {
            try {
                if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
                    Lampa.Controller.toggle('settings');
                }
            } catch (e) {}

            try {
                var store = $('[data-component="' + COMPONENT + '"].selector:visible').first();
                var target = $();

                if (store.length) {
                    target = store.nextAll('.settings-folder.selector:visible,.settings-param.selector:visible').not('[data-component="' + COMPONENT + '"]').first();
                    if (!target.length) target = store.prevAll('.settings-folder.selector:visible,.settings-param.selector:visible').not('[data-component="' + COMPONENT + '"]').first();
                }

                if (!target.length) {
                    target = $('.settings-folder.selector:visible,.settings-param.selector:visible').not('[data-component="' + COMPONENT + '"]').first();
                }

                if (target.length && Lampa.Controller && typeof Lampa.Controller.collectionFocus === 'function') {
                    Lampa.Controller.collectionFocus(target);
                }
            } catch (e2) {}
        }, delay || 80);
    }

    function normalizePluginUrl(url) {
        return String(url || '').replace(/\s+/g, '').replace('cub.watch', (window.lampa_settings && window.lampa_settings.cub_domain) || 'cub.red');
    }

    function parsePluginList(list) {
        if (typeof list == 'string') {
            try {
                list = JSON.parse(list);
            } catch (e) {
                list = [];
            }
        }

        return Array.isArray(list) ? list : [];
    }

    function managerPlugins() {
        try {
            if (Lampa.Plugins && typeof Lampa.Plugins.get === 'function') {
                return parsePluginList(Lampa.Plugins.get());
            }
        } catch (e) {
            return [];
        }

        return [];
    }

    function storagePlugins() {
        try {
            if (Lampa.Storage && typeof Lampa.Storage.get === 'function') {
                return parsePluginList(Lampa.Storage.get('plugins', '[]'));
            }
        } catch (e) {
            return [];
        }

        return [];
    }

    function normalizeInstalledEntry(item) {
        if (typeof item == 'string') {
            return { url: item, status: 1 };
        }

        if (item && typeof item == 'object') {
            if (!item.url && item.link) item.url = item.link;
            if (item.status == null) item.status = 1;
            return item;
        }

        return null;
    }

    function installedPlugins() {
        var list = [];
        var seen = {};

        function append(items) {
            parsePluginList(items).forEach(function (item) {
                var entry = normalizeInstalledEntry(item);
                var key = normalizePluginUrl(entry && entry.url);

                if (!key || seen[key]) return;

                seen[key] = true;
                list.push(entry);
            });
        }

        append(managerPlugins());
        append(storagePlugins());

        return list;
    }

    function findInstalledPlugin(plugin) {
        var url = normalizePluginUrl(plugin.url);
        var list = installedPlugins();
        var result = null;

        if (!url) return result;

        list.some(function (item, index) {
            var installed = item && (item.url || item.link);

            if (normalizePluginUrl(installed) == url) {
                result = {
                    item: item,
                    index: index,
                    list: list
                };

                return true;
            }

            return false;
        });

        return result;
    }

    function isInstalled(plugin) {
        return !!findInstalledPlugin(plugin);
    }

    function saveInstalledList(list) {
        if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
            Lampa.Storage.set('plugins', list);
        } else if (Lampa.Plugins && typeof Lampa.Plugins.save === 'function') {
            Lampa.Plugins.save();
        }
    }

    function hasPluginUrl(list, plugin) {
        var url = normalizePluginUrl(plugin && plugin.url);
        var found = false;

        if (!url) return found;

        parsePluginList(list).some(function (item) {
            var entry = typeof item == 'string' ? item : item && (item.url || item.link);

            if (normalizePluginUrl(entry) == url) {
                found = true;
                return true;
            }

            return false;
        });

        return found;
    }

    function cardStateInfo(plugin, state) {
        if (state == 'installing') {
            return {
                classes: 'hps-card--installing',
                button: 'Ждите',
                label: 'Установка',
                runtime: 'Сохраняю'
            };
        }

        var installed = findInstalledPlugin(plugin);

        if (!installed) {
            return {
                classes: 'hps-card--ready',
                button: 'Установить',
                label: 'Не установлен',
                runtime: 'Можно установить'
            };
        }

        if (installed.item.status == 0 || state == 'disabled') {
            return {
                classes: 'hps-card--disabled',
                button: 'Включить',
                label: 'Отключен',
                runtime: 'Не запускается'
            };
        }

        try {
            if (Lampa.Plugins && typeof Lampa.Plugins.errors === 'function' && hasPluginUrl(Lampa.Plugins.errors(), plugin)) {
                return {
                    classes: 'hps-card--installed hps-card--error',
                    button: 'Управлять',
                    label: 'Ошибка',
                    runtime: 'Не загрузился'
                };
            }
        } catch (e) {}

        try {
            if (Lampa.Plugins && typeof Lampa.Plugins.loaded === 'function' && hasPluginUrl(Lampa.Plugins.loaded(), plugin)) {
                return {
                    classes: 'hps-card--installed hps-card--loaded',
                    button: 'Управлять',
                    label: 'Установлен',
                    runtime: 'Запущен'
                };
            }
        } catch (e2) {}

        return {
            classes: 'hps-card--installed hps-card--pending',
            button: 'Управлять',
            label: 'Установлен',
            runtime: 'После перезапуска'
        };
    }

    function updateCardState(card, plugin, state) {
        if (!card || !card.length) return;

        var info = cardStateInfo(plugin, state);

        card.removeClass('hps-card--ready hps-card--installed hps-card--installing hps-card--disabled hps-card--loaded hps-card--pending hps-card--error');
        card.addClass(info.classes);
        card.find('.hps-install').text(info.button);
        card.find('.hps-state').text(info.label);
        card.find('.hps-runtime').text(info.runtime);
    }

    function savePluginFallback(data) {
        var list = installedPlugins();
        var saved = false;

        if (!hasPluginUrl(list, data)) list.push(data);
        if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
            Lampa.Storage.set('plugins', list);
            saved = true;
        }

        if (Lampa.Utils && typeof Lampa.Utils.putScriptAsync === 'function') {
            Lampa.Utils.putScriptAsync([data.url], false, false, function () {}, false);
            return true;
        } else if (Lampa.Utils && typeof Lampa.Utils.putScript === 'function') {
            Lampa.Utils.putScript([data.url], function () {}, false, function () {}, true);
            return true;
        }

        return saved;
    }

    function addInstalledPlugin(data) {
        if (Lampa.Plugins && typeof Lampa.Plugins.add === 'function') {
            Lampa.Plugins.add(data);
            return true;
        }

        var list = installedPlugins();
        var saved = false;

        if (!hasPluginUrl(list, data)) list.push(data);

        if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
            Lampa.Storage.set('plugins', list);
            saved = true;
        } else if (Lampa.Plugins && typeof Lampa.Plugins.save === 'function') {
            Lampa.Plugins.save();
            saved = true;
        }

        if (Lampa.Plugins && typeof Lampa.Plugins.push === 'function') {
            Lampa.Plugins.push(data);
        } else if (Lampa.Utils && typeof Lampa.Utils.putScriptAsync === 'function') {
            Lampa.Utils.putScriptAsync([data.url], false, false, function () {}, false);
        } else if (Lampa.Utils && typeof Lampa.Utils.putScript === 'function') {
            Lampa.Utils.putScript([data.url], function () {}, false, function () {}, true);
        } else {
            return saved;
        }

        return true;
    }

    function installPlugin(plugin, card, complete) {
        var url = String(plugin.url || '').trim();

        if (!url) {
            if (Lampa.Noty) Lampa.Noty.show('У плагина нет ссылки для установки');
            if (complete) complete(false);
            return;
        }

        if (isInstalled(plugin)) {
            updateCardState(card, plugin, 'installed');
            if (Lampa.Noty) Lampa.Noty.show('Плагин уже установлен');
            if (complete) complete(true);
            return;
        }

        if (installing[url]) return;

        installing[url] = true;
        ignoreActionMenuUntil[url] = Date.now() + 1500;
        updateCardState(card, plugin, 'installing');

        var data = {
            url: url,
            status: 1,
            name: plugin.name,
            author: plugin.author,
            from: 'Plugin Hub',
            source: STORE_URL
        };

        if (plugin.store) data.store = plugin.store;

        try {
            if (!addInstalledPlugin(data)) {
                throw new Error('Lampa.Plugins.add не найден');
            }

            setTimeout(function () {
                installing[url] = false;
                ignoreActionMenuUntil[url] = Date.now() + 1500;
                updateCardState(card, plugin);
                if (complete) complete(isInstalled(plugin));
            }, 550);
        } catch (e) {
            installing[url] = false;
            delete ignoreActionMenuUntil[url];
            updateCardState(card, plugin, 'ready');
            console.log('Plugin install error:', e);
            if (Lampa.Noty) Lampa.Noty.show('Не удалось установить плагин');
            if (complete) complete(false);
        }
    }

    function statusUrl(url) {
        var result = url;

        try {
            if (Lampa.Utils && typeof Lampa.Utils.fixMirrorLink === 'function') result = Lampa.Utils.fixMirrorLink(result);
            if (Lampa.Utils && typeof Lampa.Utils.rewriteIfHTTPS === 'function') result = Lampa.Utils.rewriteIfHTTPS(result);
        } catch (e) {}

        return result;
    }

    function checkPluginStatus(plugin, row, card) {
        var url = plugin.url;
        var status = row.find('.hps-action-item-status');

        if (!url) {
            status.text('нет ссылки');
            return;
        }

        status.text('проверяю');

        function display(text) {
            status.text(text);

            if (card && card.length) {
                card.find('.hps-runtime').text(text);
            }
        }

        try {
            var network = new Lampa.Reguest();
            if (typeof network.timeout === 'function') network.timeout(5000);
            network["native"](statusUrl(url), function (str) {
                display(/Lampa\./.test(str || '') ? 'ссылка рабочая' : 'не подтверждён');
            }, function () {
                display('ошибка');
            }, false, {
                dataType: 'text'
            });
        } catch (e) {
            if (window.fetch) {
                fetch(statusUrl(url))
                    .then(function (response) { return response.text().then(function (text) { return { response: response, text: text }; }); })
                    .then(function (result) {
                        display(/Lampa\./.test(result.text || '') ? result.response.status + ' рабочий' : result.response.status + ' не подтверждён');
                    })
                    .catch(function () {
                        display('ошибка');
                    });
            } else {
                display('недоступно');
            }
        }
    }

    function toggleInstalled(plugin, card) {
        var found = findInstalledPlugin(plugin);
        if (!found) return;

        found.item.status = found.item.status == 0 ? 1 : 0;
        saveInstalledList(found.list);

        if (found.item.status == 1 && Lampa.Plugins && typeof Lampa.Plugins.push === 'function') {
            Lampa.Plugins.push(found.item);
        } else if (Lampa.Noty) {
            Lampa.Noty.show('Для полного отключения может потребоваться перезагрузка');
        }

        updateCardState(card, plugin);
        closeActionMenu();
    }

    function removeInstalled(plugin, card) {
        var found = findInstalledPlugin(plugin);
        if (!found) return;

        if (Lampa.Plugins && typeof Lampa.Plugins.remove === 'function') {
            Lampa.Plugins.remove(found.item);
        }

        found.list.splice(found.index, 1);
        saveInstalledList(found.list);

        updateCardState(card, plugin, 'ready');
        closeActionMenu();
        if (Lampa.Noty) Lampa.Noty.show('Плагин удалён');
    }

    function editInstalled(plugin, card, field) {
        var found = findInstalledPlugin(plugin);
        if (!found) return;

        var current = field == 'name' ? (found.item.name || plugin.name) : (found.item.url || plugin.url);
        var title = field == 'name' ? 'Изменить название' : 'Изменить ссылку';

        closeActionMenu();

        function save(value) {
            value = String(value || '').trim();
            if (!value) return;

            if (field == 'name') {
                found.item.name = value;
                plugin.name = value;
                card.find('.hps-name').text(value);
            } else {
                found.item.url = value;
                plugin.url = value;
            }

            saveInstalledList(found.list);
            updateCardState(card, plugin);

            if (Lampa.Noty) Lampa.Noty.show('Изменения сохранены');
        }

        if (Lampa.Input && typeof Lampa.Input.edit === 'function') {
            Lampa.Input.edit({
                title: title,
                value: current || '',
                free: true,
                nosave: true,
                nomic: true
            }, save);
        } else {
            save(window.prompt ? window.prompt(title, current || '') : '');
        }
    }

    function actionItems() {
        return actionPanel ? actionPanel.find('.hps-action-item:not(.hps-action-item--disabled)') : $();
    }

    function setActionFocus(index) {
        var list = actionItems();
        if (!list.length) return;

        if (index < 0) index = 0;
        if (index >= list.length) index = list.length - 1;

        actionIndex = index;
        actionPanel.find('.hps-action-item').removeClass('focus');
        list.eq(actionIndex).addClass('focus');
    }

    function moveAction(direction) {
        if (direction == 'up') setActionFocus(actionIndex - 1);
        else if (direction == 'down') setActionFocus(actionIndex + 1);
        else if (direction == 'left') closeActionMenu();
    }

    function selectAction() {
        var item = actionItems().eq(actionIndex);
        if (item.length) item.trigger('hover:enter');
    }

    function closeActionMenu() {
        if (!actionPanel) return;

        actionPanel.remove();
        actionPanel = null;
        actionContext = null;
        setupFocus();
    }

    function runAction(action, row) {
        var plugin = actionContext && actionContext.plugin;
        var card = actionContext && actionContext.card;
        if (!plugin || !card) return;

        if (action == 'install') {
            installPlugin(plugin, card, function (ok) {
                if (ok) closeActionMenu();
            });
        } else if (action == 'toggle') {
            toggleInstalled(plugin, card);
        } else if (action == 'check') {
            checkPluginStatus(plugin, row, card);
        } else if (action == 'name') {
            editInstalled(plugin, card, 'name');
        } else if (action == 'url') {
            editInstalled(plugin, card, 'url');
        } else if (action == 'remove') {
            removeInstalled(plugin, card);
        }
    }

    function openActionMenu(plugin, card) {
        var found = findInstalledPlugin(plugin);
        var enabled = found && found.item.status != 0;
        var info = cardStateInfo(plugin);
        var items = [];

        closeActionMenu();

        items.push(found ? {
            title: enabled ? 'Отключить' : 'Включить',
            action: 'toggle',
            status: enabled ? info.runtime : 'сейчас отключен'
        } : {
            title: 'Установить',
            action: 'install',
            status: 'не установлен'
        });

        items.push({
            title: 'Проверить ссылку',
            action: 'check',
            status: ''
        });

        if (found) {
            items.push({ title: 'Название', action: 'name' });
            items.push({ title: 'Ссылка', action: 'url' });
            items.push({ title: 'Удалить', action: 'remove', danger: true });
        }

        actionContext = { plugin: plugin, card: card };
        actionPanel = $('<div class="hps-action-shade">' +
            '<div class="hps-action-panel">' +
                '<div class="hps-action-title">Действие</div>' +
                '<div class="hps-action-plugin">' + escapeHtml(plugin.name) + '</div>' +
                '<div class="hps-action-summary">' +
                    '<span class="hps-action-summary-state">' + escapeHtml(info.label) + '</span>' +
                    '<span class="hps-action-summary-text">' + escapeHtml(info.runtime) + '</span>' +
                '</div>' +
            '</div>' +
        '</div>');

        var body = actionPanel.find('.hps-action-panel');

        items.forEach(function (item) {
            var row = $('<div class="hps-action-item' +
                (item.disabled ? ' hps-action-item--disabled' : '') +
                (item.danger ? ' hps-action-item--danger' : '') +
                '" data-action="' + escapeHtml(item.action || '') + '">' +
                    '<span>' + escapeHtml(item.title) + '</span>' +
                    '<span class="hps-action-item-status">' + escapeHtml(item.status || '') + '</span>' +
                '</div>');

            if (!item.disabled) {
                row.on('hover:enter click', function (e) {
                    stopEvent(e);
                    runAction(item.action, row);
                });

                row.on('mouseenter.home_plugins_store_clean', function () {
                    var index = actionItems().index(this);
                    if (index > -1) setActionFocus(index);
                });
            }

            body.append(row);
        });

        actionPanel.on('click', function (e) {
            if ($(e.target).hasClass('hps-action-shade')) closeActionMenu();
        });

        active.append(actionPanel);
        setTimeout(function () { setActionFocus(0); }, 30);
    }

    function render(sections) {
        if (!active) return;

        var scroll = active.find('.hps-scroll');
        scroll.empty();

        if (!sections.length) {
            scroll.append('<div class="hps-empty">Каталог не загрузился. Проверь extensions.json.</div>');
            setupFocus();
            return;
        }

        sections.forEach(function (section) {
            var block = $('<div class="hps-section"></div>');
            var grid = $('<div class="hps-grid"></div>');

            section.items.forEach(function (plugin) {
                var card = $('<div class="hps-card selector' + (plugin.cover ? ' hps-card--cover' : '') + originClass(plugin) + '">' +
                    '<div class="hps-cover">' + (plugin.cover ? '<img src="' + escapeHtml(plugin.cover) + '" alt="">' : '') + '</div>' +
                    '<div class="hps-name">' + escapeHtml(plugin.name) + '</div>' +
                    '<div class="hps-desc">' + escapeHtml(plugin.descr) + '</div>' +
                    '<div class="hps-status"><span class="hps-state"></span><span class="hps-runtime"></span></div>' +
                    '<div class="hps-meta">' + escapeHtml(plugin.author) + ' • v' + escapeHtml(plugin.version) + '</div>' +
                    '<div class="hps-card-footer">' +
                        '<div class="hps-install">Установить</div>' +
                    '</div>' +
                '</div>');

                updateCardState(card, plugin);

                card.on('hover:enter click', function (e) {
                    stopEvent(e);
                    if (isInstalled(plugin)) {
                        if (Date.now() < (ignoreActionMenuUntil[plugin.url] || 0)) return;
                        openActionMenu(plugin, card);
                    }
                    else installPlugin(plugin, card);
                });

                card.on('mouseenter.home_plugins_store_clean', function () {
                    focusByElement(this);
                });

                grid.append(card);
            });

            block.append('<div class="hps-section-title">' + escapeHtml(section.title) + '</div>');
            block.append(grid);
            scroll.append(block);

            updateSectionScrollState(grid);
            grid.on('scroll.home_plugins_store_clean', function () {
                updateSectionScrollState($(this));
            });
        });

        setupFocus();
    }

    function updateSectionScrollState(grid) {
        if (!grid || !grid.length) return;

        var el = grid[0];
        var section = grid.closest('.hps-section');
        var canScroll = el.scrollWidth > el.clientWidth + 8;
        var atStart = el.scrollLeft <= 8;
        var atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;

        section.toggleClass('hps-section--start', !canScroll || atStart);
        section.toggleClass('hps-section--end', !canScroll || atEnd);
    }

    function focusables() {
        return active ? active.find('.selector:visible') : $();
    }

    function topButtons() {
        return active ? active.find('.hps-topbtn.selector:visible') : $();
    }

    function setFocus(index) {
        var list = focusables();
        if (!list.length) return;

        if (index < 0) index = 0;
        if (index >= list.length) index = list.length - 1;

        focusIndex = index;
        active.find('.selector').removeClass('focus hover');

        var el = list.eq(focusIndex);
        el.addClass('focus');
        ensureVisible(el);

        try {
            if (Lampa.Controller && typeof Lampa.Controller.collectionFocus === 'function') {
                Lampa.Controller.collectionFocus(el);
            }
        } catch (e) {}
    }

    function focusByElement(element) {
        lastMoveDirection = '';
        var index = focusables().index(element);
        if (index > -1) setFocus(index);
    }

    function focusElement(element) {
        if (!element) return false;

        var index = focusables().index(element);
        if (index > -1) {
            setFocus(index);
            return true;
        }

        return false;
    }

    function fallbackMove(direction) {
        var list = focusables();

        if (direction == 'left' || direction == 'up') {
            setFocus(focusIndex - 1);
        } else if (direction == 'right' || direction == 'down') {
            setFocus(Math.min(list.length - 1, focusIndex + 1));
        }
    }

    function moveCardFocus(direction, current) {
        if (!current || !current.hasClass('hps-card')) return false;

        var row = current.closest('.hps-grid');
        var cards = row.find('.hps-card.selector:visible');
        var cardIndex = cards.index(current);

        if (!row.length || cardIndex < 0) return false;

        if (direction == 'left' || direction == 'right') {
            var nextIndex = direction == 'left' ? cardIndex - 1 : cardIndex + 1;

            if (nextIndex >= 0 && nextIndex < cards.length) {
                focusElement(cards.eq(nextIndex)[0]);
            }

            return true;
        }

        if (direction == 'up' || direction == 'down') {
            var section = current.closest('.hps-section');
            var targetSection = direction == 'up' ? section.prev('.hps-section') : section.next('.hps-section');

            if (targetSection.length) {
                var targetCards = targetSection.find('.hps-card.selector:visible');
                var targetIndex = Math.min(cardIndex, targetCards.length - 1);

                if (targetIndex >= 0) focusElement(targetCards.eq(targetIndex)[0]);
                return true;
            }

            if (direction == 'up') {
                var buttons = topButtons();
                var buttonIndex = Math.min(cardIndex, buttons.length - 1);
                if (buttonIndex >= 0) focusElement(buttons.eq(buttonIndex)[0]);
                return true;
            }
        }

        return false;
    }

    function moveTopFocus(direction, current) {
        if (!current || !current.hasClass('hps-topbtn')) return false;

        var buttons = topButtons();
        var buttonIndex = buttons.index(current);

        if (buttonIndex < 0) return true;

        if (direction == 'left' || direction == 'right') {
            var nextButton = direction == 'left' ? buttonIndex - 1 : buttonIndex + 1;

            if (nextButton >= 0 && nextButton < buttons.length) {
                focusElement(buttons.eq(nextButton)[0]);
            }

            return true;
        }

        if (direction == 'down') {
            var firstRowCards = active.find('.hps-section').first().find('.hps-card.selector:visible');
            var cardIndex = Math.min(buttonIndex, firstRowCards.length - 1);

            if (cardIndex >= 0) focusElement(firstRowCards.eq(cardIndex)[0]);
            return true;
        }

        if (direction == 'up') return true;

        return false;
    }

    function moveFocus(direction) {
        lastMoveDirection = direction;
        var list = focusables();
        var current = list.eq(focusIndex);

        if (!list.length) return;
        if (!current.length) {
            setFocus(0);
            return;
        }

        if (moveTopFocus(direction, current)) return;
        if (moveCardFocus(direction, current)) return;

        var rect = current[0].getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var best = -1;
        var bestScore = Infinity;

        list.each(function (index) {
            if (index == focusIndex) return;

            var itemRect = this.getBoundingClientRect();
            var ix = itemRect.left + itemRect.width / 2;
            var iy = itemRect.top + itemRect.height / 2;
            var primary = 0;
            var secondary = 0;

            if (direction == 'left') {
                primary = cx - ix;
                secondary = Math.abs(cy - iy);
            } else if (direction == 'right') {
                primary = ix - cx;
                secondary = Math.abs(cy - iy);
            } else if (direction == 'up') {
                primary = cy - iy;
                secondary = Math.abs(cx - ix);
            } else if (direction == 'down') {
                primary = iy - cy;
                secondary = Math.abs(cx - ix);
            }

            if (primary <= 4) return;

            var score = primary * 1000 + secondary;
            if (score < bestScore) {
                bestScore = score;
                best = index;
            }
        });

        if (best > -1) setFocus(best);
        else fallbackMove(direction);
    }

    function ensureVisible(el) {
        var scroll = active && active.find('.hps-scroll')[0];
        if (!scroll || !el || !el.length) return;

        if (lastMoveDirection != 'left' && lastMoveDirection != 'right') {
            var scrollRect = scroll.getBoundingClientRect();
            var verticalRect = el[0].getBoundingClientRect();
            var edge = 36;

            if (verticalRect.top < scrollRect.top + edge) {
                scroll.scrollTop -= (scrollRect.top + edge) - verticalRect.top;
            } else if (verticalRect.bottom > scrollRect.bottom - edge) {
                scroll.scrollTop += verticalRect.bottom - (scrollRect.bottom - edge);
            }
        }

        var row = el.closest('.hps-grid')[0];
        if (!row) return;

        var rowRect = row.getBoundingClientRect();
        var itemRect = el[0].getBoundingClientRect();

        if (itemRect.left < rowRect.left + 24) row.scrollLeft -= (rowRect.left + 32) - itemRect.left;
        else if (itemRect.right > rowRect.right - 24) row.scrollLeft += itemRect.right - (rowRect.right - 32);

        updateSectionScrollState($(row));
    }

    function bindKeys() {
        if (keyBound) return;
        keyBound = true;

        $(document).on('keydown.home_plugins_store_clean_v4', function (e) {
            if (!active) return;

            var code = e.keyCode || e.which;

            if (code == 37 || code == 21) {
                stopEvent(e);
                if (actionPanel) moveAction('left');
                else moveFocus('left');
            } else if (code == 39 || code == 22) {
                stopEvent(e);
                if (actionPanel) moveAction('right');
                else moveFocus('right');
            } else if (code == 38 || code == 19) {
                stopEvent(e);
                if (actionPanel) moveAction('up');
                else moveFocus('up');
            } else if (code == 40 || code == 20) {
                stopEvent(e);
                if (actionPanel) moveAction('down');
                else moveFocus('down');
            } else if (code == 13 || code == 23 || code == 66) {
                stopEvent(e);
                if (actionPanel) {
                    selectAction();
                } else {
                    var el = focusables().eq(focusIndex);
                    if (el.length) el.trigger('hover:enter');
                }
            } else if (code == 4 || code == 8 || code == 27 || code == 461 || code == 10009) {
                stopEvent(e);
                if (actionPanel) closeActionMenu();
                else closeScreen(true);
            }
        });
    }

    function unbindKeys() {
        keyBound = false;
        $(document).off('keydown.home_plugins_store_clean_v4');
    }

    function setupFocus() {
        if (!active) return;
        var restoreIndex = Math.max(0, focusIndex);

        try {
            if (Lampa.Controller) Lampa.Controller.collectionSet(active);
        } catch (e) {}

        setTimeout(function () { setFocus(restoreIndex); }, 60);
    }

    function addController() {
        if (!Lampa.Controller) return;

        if (!controllerAdded) {
            Lampa.Controller.add(CONTROLLER, {
                toggle: setupFocus,
                update: setupFocus,
                left: function () { if (actionPanel) moveAction('left'); else moveFocus('left'); },
                right: function () { if (actionPanel) moveAction('right'); else moveFocus('right'); },
                up: function () { if (actionPanel) moveAction('up'); else moveFocus('up'); },
                down: function () { if (actionPanel) moveAction('down'); else moveFocus('down'); },
                back: function () { if (actionPanel) closeActionMenu(); else closeScreen(true); }
            });

            controllerAdded = true;
        }

        Lampa.Controller.toggle(CONTROLLER);
    }

    function openScreen() {
        addCss();

        if (active) closeScreen(false);
        else $('.hps-screen').remove();

        focusIndex = 0;

        active = $('<div class="hps-screen">' +
            '<div class="hps-head">' +
                '<div class="hps-brand">' +
                    '<div class="hps-logo">⌂</div>' +
                    '<div>' +
                        '<div class="hps-title">Plugin Hub</div>' +
                        '<div class="hps-subtitle">Бесплатные плагины без подписки. Установка не выводит из магазина.</div>' +
                    '</div>' +
                '</div>' +
                '<div class="hps-actions">' +
                    '<div class="hps-topbtn selector" data-action="refresh">Обновить</div>' +
                    '<div class="hps-topbtn selector" data-action="close">Закрыть</div>' +
                '</div>' +
            '</div>' +
            '<div class="hps-scroll"><div class="hps-empty">Загрузка каталога...</div></div>' +
        '</div>');

        active.find('[data-action="close"]').on('hover:enter click', function (e) {
            stopEvent(e);
            closeScreen(true);
        });

        active.find('[data-action="refresh"]').on('hover:enter click', function (e) {
            stopEvent(e);
            if (!active) return;

            active.find('.hps-scroll').html('<div class="hps-empty">Обновляю каталог...</div>');
            load(render);
        });

        active.find('.hps-topbtn').on('mouseenter.home_plugins_store_clean', function () {
            focusByElement(this);
        });

        $('body').append(active);
        bindKeys();
        addController();
        load(render);
        setupFocus();
    }

    function closeScreen(backToSettings) {
        ignoreOpenUntil = Date.now() + 900;
        closeActionMenu();
        $('.hps-screen').remove();
        active = null;
        unbindKeys();

        if (backToSettings) {
            /*
             * Экран магазина открыт поверх настроек. После удаления overlay настройки уже видны.
             * Но на некоторых сборках Lampa фокус остаётся на кастомном controller.
             * Поэтому мягко возвращаем управление в settings с задержкой.
             */
            returnToSettings(80);
        }
    }

    function bindSettingsItem(root) {
        var scope = root && root.length ? root : $('body');

        scope.find('[data-component="' + COMPONENT + '"]')
            .off('hover:enter click')
            .on('hover:enter click', function (e) {
                stopEvent(e);
                if (Date.now() < ignoreOpenUntil) return;
                openScreen();
            });
    }

    function createSettingsItem() {
        return $(
            '<div class="settings-param selector" data-component="' + COMPONENT + '" data-static="true">' +
                '<div class="settings-param__icon">' + smallIcon() + '</div>' +
                '<div class="settings-param__body">' +
                    '<div class="settings-param__name">' + Lampa.Lang.translate('home_plugins_store_title') + '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function addSettingsItem(body) {
        addCss();

        if (!Lampa.Settings || !Lampa.Settings.main) return;

        try {
            var main = Lampa.Settings.main();
            var render = body && body.length ? body : main.render();

            if (!render || !render.length || typeof render.find !== 'function') return;
            var exists = render.find('[data-component="' + COMPONENT + '"]');
            if (exists.length) {
                exists.each(function () {
                    var item = $(this);

                    if (!item.is('.settings-param')) item.replaceWith(createSettingsItem());
                    else item.attr('data-static', 'true');
                });

                bindSettingsItem(render);
                return;
            }

            var field = createSettingsItem();

            var after = render.find('[data-component="more"], [data-component="extensions"], [data-component="plugins"]').first();
            if (after.length) after.after(field);
            else render.append(field);

            bindSettingsItem(render);

            if (!body && typeof main.update === 'function') main.update();
        } catch (e) {
            console.log('Store settings item error:', e);
        }
    }

    if (Lampa.Settings && Lampa.Settings.listener) {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'main') addSettingsItem(e.body);
        });
    }

    if (window.appready) addSettingsItem();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addSettingsItem();
        });
    }
})();
