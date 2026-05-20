/*
 * name: Дом плагинов
 * author: shardice
 * version: 1.5.3
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
            ru: 'Дом плагинов',
            en: 'Plugin Home',
            uk: 'Дім плагінів'
        },
        home_plugins_store_descr: {
            ru: '',
            en: '',
            uk: ''
        }
    });

    function smallIcon() {
        return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">' +
            '<path d="M16 13h32c3.1 0 5.7 2.2 6.3 5.2L56 29H8l1.7-10.8C10.3 15.2 12.9 13 16 13Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M8 29v1.8a7 7 0 0 0 14 0V29M22 29v1.8a7 7 0 0 0 14 0V29M36 29v1.8a7 7 0 0 0 14 0V29M50 29v1.8a6.8 6.8 0 0 0 6-1.8" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M12 34v15c0 4.4 3.6 8 8 8h24c4.4 0 8-3.6 8-8V34" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>' +
            '<rect x="20" y="40" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="4"/>' +
            '<rect x="34" y="40" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="4"/>' +
            '<rect x="20" y="51" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="4"/>' +
            '<path d="M42 54h12M48 48v12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
        '</svg>';
    }

    function addCss() {
        if ($('#home-plugins-store-style-clean-v14').length) return;
        $('#home-plugins-store-style-clean-v13').remove();
        $('#home-plugins-store-style-clean-v12').remove();
        $('#home-plugins-store-style-clean-v11').remove();
        $('#home-plugins-store-style-clean-v10').remove();
        $('#home-plugins-store-style-clean-v9').remove();
        $('#home-plugins-store-style-clean-v8').remove();
        $('#home-plugins-store-style-clean-v7').remove();

        $('body').append('<style id="home-plugins-store-style-clean-v14">' +
            '[data-component="' + COMPONENT + '"] .settings-folder__icon{color:#fff!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-folder__icon svg,[data-component="' + COMPONENT + '"] .settings-folder__icon svg *{max-width:100%;}' +
            '[data-component="' + COMPONENT + '"] .settings-folder__icon svg{width:2em!important;height:2em!important;display:block!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-folder__name{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}' +

            '.hps-screen{position:fixed;left:0;top:0;right:0;bottom:0;z-index:999999;background:#202121;color:#fff;padding:1.55em 0 0 0;box-sizing:border-box;overflow:hidden;}' +
            '.hps-head{height:2.4em;display:flex;align-items:flex-start;justify-content:space-between;padding:0 1.8em;margin-bottom:.35em;box-sizing:border-box;}' +
            '.hps-brand{display:flex;align-items:center;gap:.65em;min-width:0;}' +
            '.hps-logo{display:none;}' +
            '.hps-title{font-size:1.05em;font-weight:900;line-height:1.1;white-space:nowrap;letter-spacing:0;}' +
            '.hps-subtitle{display:none;}' +
            '.hps-actions{display:flex;align-items:center;gap:.7em;flex-shrink:0;}' +
            '.hps-topbtn{padding:.45em .75em;border-radius:.5em;background:rgba(255,255,255,.08);border:0;font-weight:800;font-size:.82em;white-space:nowrap;color:rgba(255,255,255,.78);}' +
            '.hps-scroll{height:calc(100% - 2.75em);overflow-y:auto;overflow-x:hidden;padding:0 0 5em 0;box-sizing:border-box;scroll-behavior:auto;overscroll-behavior:contain;}' +
            '.hps-section{position:relative;margin:0 0 1.95em 0;}' +
            '.hps-section:before{content:"‹";position:absolute;left:0;top:2.05em;bottom:.65em;width:4.4em;display:flex;align-items:center;justify-content:flex-start;padding-left:1.1em;box-sizing:border-box;font-size:2.4em;font-weight:300;color:rgba(255,255,255,.46);pointer-events:none;background:linear-gradient(270deg,rgba(32,33,33,0),#202121 76%);z-index:2;}' +
            '.hps-section:after{content:"›";position:absolute;right:0;top:2.05em;bottom:.65em;width:4.4em;display:flex;align-items:center;justify-content:flex-end;padding-right:1.1em;box-sizing:border-box;font-size:2.4em;font-weight:300;color:rgba(255,255,255,.46);pointer-events:none;background:linear-gradient(90deg,rgba(32,33,33,0),#202121 76%);}' +
            '.hps-section--start:before{display:none;}' +
            '.hps-section--end:after{display:none;}' +
            '.hps-section-title{font-size:1.05em;font-weight:900;margin:0 0 .75em 0;padding:0 1.8em;color:rgba(255,255,255,.94);}' +
            '.hps-grid{display:flex;gap:1em;overflow-x:auto;overflow-y:hidden;padding:0 1.8em .75em 1.8em;box-sizing:border-box;scroll-behavior:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x pan-y;}' +
            '.hps-grid::-webkit-scrollbar,.hps-scroll::-webkit-scrollbar{width:.45em;height:.45em;}' +
            '.hps-grid::-webkit-scrollbar-track{background:rgba(255,255,255,.05);border-radius:1em;margin:0 1.8em;}' +
            '.hps-grid::-webkit-scrollbar-thumb,.hps-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.30);border-radius:1em;}' +
            '.hps-card{position:relative;flex:0 0 21.4em;min-height:13.9em;border-radius:.72em;background:#3c3c3c;border:0;box-shadow:none;overflow:hidden;padding:1em 1em 3.25em 1em;box-sizing:border-box;}' +
            '.hps-card:before{content:"";position:absolute;left:0;right:0;top:0;height:.32em;z-index:1;pointer-events:none;background:rgba(255,255,255,.18);}' +
            '.hps-card--own{background:linear-gradient(180deg,rgba(48,73,69,.72),#3c3c3c 44%);}' +
            '.hps-card--external{background:linear-gradient(180deg,rgba(69,63,56,.62),#3c3c3c 44%);}' +
            '.hps-card--own:before{background:rgba(112,214,178,.70);}' +
            '.hps-card--external:before{background:rgba(214,186,128,.58);}' +
            '.hps-cover{height:0;border-radius:.45em;background:transparent;overflow:hidden;box-shadow:none;margin:0;}' +
            '.hps-card--cover .hps-cover{height:9.45em;margin:-1em -1em .9em -1em;border-radius:.72em .72em 0 0;background:#2c2c2c;}' +
            '.hps-cover img{display:block;width:100%;height:100%;object-fit:cover;}' +
            '.hps-name{margin-top:0;font-size:1.05em;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-desc{margin-top:.58em;max-height:4.2em;color:rgba(255,255,255,.82);font-size:.78em;font-weight:400;line-height:1.38;overflow:hidden;}' +
            '.hps-meta{position:absolute;left:1em;right:8.8em;bottom:1.1em;color:rgba(255,255,255,.44);font-size:.74em;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-card-footer{position:absolute;right:1em;bottom:.82em;display:flex;align-items:center;justify-content:flex-end;}' +
            '.hps-install{height:2.05em;padding:0 .95em;border-radius:.5em;background:#7ee05f;color:#101510;font-size:.78em;font-weight:900;display:flex;align-items:center;justify-content:center;min-width:6.7em;box-shadow:none;}' +
            '.hps-card--installed .hps-install{background:rgba(255,255,255,.11);color:rgba(255,255,255,.45);}' +
            '.hps-card--installing .hps-install{background:rgba(255,255,255,.14);color:#fff;box-shadow:none;}' +
            '.hps-card--disabled .hps-install{background:rgba(255,255,255,.09);color:rgba(255,255,255,.58);box-shadow:none;}' +
            '.hps-empty{margin:0 1.8em;padding:2em;border-radius:.7em;background:#3c3c3c;font-weight:850;color:rgba(255,255,255,.72);}' +
            '.hps-action-shade{position:absolute;z-index:8;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,.34);display:flex;justify-content:flex-end;}' +
            '.hps-action-panel{width:34em;max-width:46vw;height:100%;background:rgba(31,34,38,.98);box-shadow:-2em 0 3em rgba(0,0,0,.30);padding:2em 0;box-sizing:border-box;}' +
            '.hps-action-title{font-size:2.3em;font-weight:300;margin:0 1.05em 1.2em;line-height:1.1;}' +
            '.hps-action-plugin{margin:-1.8em 2.45em 1.4em;color:rgba(255,255,255,.48);font-size:.95em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-action-item{font-size:1.28em;font-weight:800;padding:1.05em 2em;min-height:3.2em;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:1em;color:#fff;}' +
            '.hps-action-item.focus{background:rgba(255,255,255,.10);box-shadow:none!important;transform:none!important;border-color:transparent!important;}' +
            '.hps-action-item--disabled{opacity:.36;pointer-events:none;}' +
            '.hps-action-item--danger{color:#ffb3b3;}' +
            '.hps-action-item-status{font-size:.75em;font-weight:800;color:rgba(255,255,255,.58);white-space:nowrap;}' +
            '.hps-screen .selector.focus,.hps-screen .selector.hover{box-shadow:0 0 0 .18em rgba(255,255,255,.78)!important;transform:none!important;}' +
            '@media(max-width:1280px){.hps-card{flex-basis:19.6em}.hps-screen{padding-top:1.25em}.hps-meta{right:8.1em}}' +
            '@media(max-width:760px){.hps-head{padding:0 1em}.hps-section-title{padding:0 1em}.hps-grid{padding-left:1em;padding-right:1em}.hps-card{flex-basis:17.8em}.hps-card--cover .hps-cover{height:8em}.hps-desc{font-size:.75em}.hps-section:before,.hps-section:after{width:3em}}' +
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

    function installedPlugins() {
        var list = [];

        try {
            if (Lampa.Plugins && typeof Lampa.Plugins.get === 'function') {
                list = Lampa.Plugins.get();
            } else if (Lampa.Storage && typeof Lampa.Storage.get === 'function') {
                list = Lampa.Storage.get('plugins', '[]');
            }
        } catch (e) {
            list = [];
        }

        if (typeof list == 'string') {
            try {
                list = JSON.parse(list);
            } catch (e2) {
                list = [];
            }
        }

        return Array.isArray(list) ? list : [];
    }

    function findInstalledPlugin(plugin) {
        var url = normalizePluginUrl(plugin.url);
        var list = installedPlugins();
        var result = null;

        if (!url) return result;

        list.some(function (item, index) {
            var installed = typeof item == 'string' ? item : item && (item.url || item.link);

            if (normalizePluginUrl(installed) == url) {
                if (typeof item == 'string') {
                    item = { url: item, status: 1 };
                    list[index] = item;
                }

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
        if (Lampa.Plugins && typeof Lampa.Plugins.save === 'function') {
            Lampa.Plugins.save();
        } else if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
            Lampa.Storage.set('plugins', list);
        }
    }

    function updateCardState(card, plugin, state) {
        if (!card || !card.length) return;

        if (!state) {
            var installed = findInstalledPlugin(plugin);
            state = installed ? (installed.item.status === 0 ? 'disabled' : 'installed') : 'ready';
        }

        card.removeClass('hps-card--installed hps-card--installing hps-card--disabled');

        if (state == 'installing') {
            card.addClass('hps-card--installing');
            card.find('.hps-install').text('Устанавливаю');
        } else if (state == 'installed') {
            card.addClass('hps-card--installed');
            card.find('.hps-install').text('Установлен');
        } else if (state == 'disabled') {
            card.addClass('hps-card--disabled');
            card.find('.hps-install').text('Отключен');
        } else {
            card.find('.hps-install').text('Установить');
        }
    }

    function savePluginFallback(data) {
        var list = installedPlugins().map(function (item) {
            return typeof item == 'string' ? { url: item, status: 1 } : item;
        });

        list.push(data);
        if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
            Lampa.Storage.set('plugins', list);
        }

        if (Lampa.Utils && typeof Lampa.Utils.putScriptAsync === 'function') {
            Lampa.Utils.putScriptAsync([data.url], false, false, function () {}, false);
        } else if (Lampa.Utils && typeof Lampa.Utils.putScript === 'function') {
            Lampa.Utils.putScript([data.url], function () {}, false, function () {}, true);
        }
    }

    function addInstalledPlugin(data) {
        var source = installedPlugins();
        var list = source.map(function (item) {
            return typeof item == 'string' ? { url: item, status: 1 } : item;
        });

        list.push(data);

        if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
            Lampa.Storage.set('plugins', list);
        } else if (Lampa.Plugins && typeof Lampa.Plugins.save === 'function') {
            if (Array.isArray(source)) source.push(data);
            Lampa.Plugins.save();
        }

        if (Lampa.Plugins && typeof Lampa.Plugins.push === 'function') {
            Lampa.Plugins.push(data);
        } else if (Lampa.Utils && typeof Lampa.Utils.putScriptAsync === 'function') {
            Lampa.Utils.putScriptAsync([data.url], false, false, function () {}, false);
        } else if (Lampa.Utils && typeof Lampa.Utils.putScript === 'function') {
            Lampa.Utils.putScript([data.url], function () {}, false, function () {}, true);
        }
    }

    function installPlugin(plugin, card, complete) {
        var url = plugin.url;

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
            author: plugin.author
        };

        try {
            if ((Lampa.Storage && typeof Lampa.Storage.set === 'function') ||
                (Lampa.Plugins && typeof Lampa.Plugins.push === 'function')) {
                addInstalledPlugin(data);
            } else if (Lampa.Utils && (typeof Lampa.Utils.putScriptAsync === 'function' || typeof Lampa.Utils.putScript === 'function')) {
                savePluginFallback(data);
            } else {
                throw new Error('Lampa.Plugins.add не найден');
            }

            setTimeout(function () {
                installing[url] = false;
                ignoreActionMenuUntil[url] = Date.now() + 1500;
                updateCardState(card, plugin, 'installed');
                if (complete) complete(true);
            }, 350);
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

    function checkPluginStatus(plugin, row) {
        var url = plugin.url;
        var status = row.find('.hps-action-item-status');

        if (!url) {
            status.text('нет ссылки');
            return;
        }

        status.text('проверка');

        function display(text) {
            status.text(text);
        }

        try {
            var network = new Lampa.Reguest();
            if (typeof network.timeout === 'function') network.timeout(5000);
            network["native"](statusUrl(url), function (str) {
                display(/Lampa\./.test(str || '') ? '200 рабочий' : '500 не подтверждён');
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

        found.item.status = found.item.status === 0 ? 1 : 0;
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
        } else if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
            found.list.splice(found.index, 1);
            Lampa.Storage.set('plugins', found.list);
        }

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
            checkPluginStatus(plugin, row);
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
        var enabled = found && found.item.status !== 0;
        var items = [];

        closeActionMenu();

        items.push(found ? {
            title: enabled ? 'Отключить' : 'Включить',
            action: 'toggle'
        } : {
            title: 'Установить',
            action: 'install'
        });

        items.push({
            title: 'Проверить статус',
            action: 'check',
            status: ''
        });

        items.push({
            title: 'Редактировать',
            disabled: true
        });

        if (found) {
            items.push({ title: 'Изменить название', action: 'name' });
            items.push({ title: 'Изменить ссылку', action: 'url' });
            items.push({ title: 'Удалить', action: 'remove', danger: true });
        }

        actionContext = { plugin: plugin, card: card };
        actionPanel = $('<div class="hps-action-shade">' +
            '<div class="hps-action-panel">' +
                '<div class="hps-action-title">Действие</div>' +
                '<div class="hps-action-plugin">' + escapeHtml(plugin.name) + '</div>' +
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
                        '<div class="hps-title">Дом плагинов</div>' +
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
            '<div class="settings-folder selector" data-component="' + COMPONENT + '">' +
                '<div class="settings-folder__icon">' + smallIcon() + '</div>' +
                '<div class="settings-folder__name">' + Lampa.Lang.translate('home_plugins_store_title') + '</div>' +
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
                if (!exists.is('.settings-folder')) {
                    exists.replaceWith(createSettingsItem());
                }

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
