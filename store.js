/*
 * name: Дом плагинов
 * author: shardice
 * version: 1.4.6
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

    Lampa.Lang.add({
        home_plugins_store_title: {
            ru: 'Дом плагинов',
            en: 'Plugin Home',
            uk: 'Дім плагінів'
        },
        home_plugins_store_descr: {
            ru: 'Бесплатные плагины без подписки',
            en: 'Free plugins without subscription',
            uk: 'Безкоштовні плагіни без підписки'
        }
    });

    function smallIcon() {
        return '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">' +
            '<defs><linearGradient id="hpsg3" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00ffd0"/><stop offset="1" stop-color="#2f80ff"/></linearGradient></defs>' +
            '<rect x="2" y="2" width="38" height="38" rx="10" fill="url(#hpsg3)"/>' +
            '<path d="M12 22h17M12 16.5h17M12 27.5h11" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/>' +
            '<circle cx="30" cy="28" r="3.4" fill="#fff"/>' +
        '</svg>';
    }

    function addCss() {
        if ($('#home-plugins-store-style-clean-v8').length) return;
        $('#home-plugins-store-style-clean-v7').remove();

        $('body').append('<style id="home-plugins-store-style-clean-v8">' +
            '[data-component="' + COMPONENT + '"]{display:flex!important;align-items:center!important;gap:0!important;min-height:5em!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__icon{width:2.8em!important;height:2.8em!important;min-width:2.8em!important;max-width:2.8em!important;margin:0 .46em 0 0!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;flex:0 0 2.8em!important;border-radius:.6em!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__body{margin:0!important;padding:0!important;min-width:0!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__icon svg,[data-component="' + COMPONENT + '"] .settings-param__icon svg *{max-width:100%;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__icon svg{width:2.72em!important;height:2.72em!important;max-width:2.72em!important;max-height:2.72em!important;display:block!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__name,[data-component="' + COMPONENT + '"] .settings-param__descr{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}' +

            '.hps-screen{position:fixed;left:0;top:0;right:0;bottom:0;z-index:999999;background:#202121;color:#fff;padding:1.55em 0 0 0;box-sizing:border-box;overflow:hidden;}' +
            '.hps-head{height:2.4em;display:flex;align-items:flex-start;justify-content:space-between;padding:0 1.8em;margin-bottom:.35em;box-sizing:border-box;}' +
            '.hps-brand{display:flex;align-items:center;gap:.65em;min-width:0;}' +
            '.hps-logo{display:none;}' +
            '.hps-title{font-size:1.05em;font-weight:900;line-height:1.1;white-space:nowrap;letter-spacing:0;}' +
            '.hps-subtitle{display:none;}' +
            '.hps-actions{display:flex;align-items:center;gap:.7em;}' +
            '.hps-topbtn{padding:.45em .75em;border-radius:.5em;background:rgba(255,255,255,.08);border:0;font-weight:800;font-size:.82em;white-space:nowrap;color:rgba(255,255,255,.78);}' +
            '.hps-scroll{height:calc(100% - 2.75em);overflow-y:auto;overflow-x:hidden;padding:0 0 5em 0;box-sizing:border-box;scroll-behavior:auto;}' +
            '.hps-section{margin:0 0 1.65em 0;}' +
            '.hps-section-title{font-size:1.05em;font-weight:900;margin:0 0 .75em 0;padding:0 1.8em;color:rgba(255,255,255,.94);}' +
            '.hps-grid{display:flex;gap:1em;overflow-x:auto;overflow-y:hidden;padding:0 1.8em .2em 1.8em;box-sizing:border-box;scroll-behavior:auto;-webkit-overflow-scrolling:touch;}' +
            '.hps-grid::-webkit-scrollbar,.hps-scroll::-webkit-scrollbar{width:.45em;height:.45em;}' +
            '.hps-grid::-webkit-scrollbar-thumb,.hps-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:1em;}' +
            '.hps-card{position:relative;flex:0 0 21.4em;min-height:10.9em;border-radius:.72em;background:#3c3c3c;border:0;box-shadow:none;overflow:hidden;padding:1em;box-sizing:border-box;}' +
            '.hps-cover{height:0;border-radius:.45em;background:transparent;overflow:hidden;box-shadow:none;margin:0;}' +
            '.hps-card--cover .hps-cover{height:9.45em;margin:-1em -1em .9em -1em;border-radius:.72em .72em 0 0;background:#2c2c2c;}' +
            '.hps-cover img{display:block;width:100%;height:100%;object-fit:cover;}' +
            '.hps-name{margin-top:0;font-size:1.05em;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-desc{margin-top:.65em;height:3.9em;color:rgba(255,255,255,.86);font-size:.78em;font-weight:700;line-height:1.38;overflow:hidden;}' +
            '.hps-meta{margin-bottom:.55em;color:rgba(255,255,255,.44);font-size:.76em;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-card-footer{position:absolute;left:1em;right:1em;bottom:.8em;display:flex;align-items:center;gap:.55em;}' +
            '.hps-install{height:1.9em;padding:0 .7em;border-radius:.45em;background:rgba(0,0,0,.24);color:#8bdc68;font-size:.78em;font-weight:900;display:flex;align-items:center;justify-content:center;min-width:4.6em;}' +
            '.hps-hint{color:rgba(255,255,255,.48);font-size:.72em;font-weight:800;line-height:1.2;}' +
            '.hps-card--installed .hps-install{background:rgba(42,42,42,.92);color:#7ee05f;box-shadow:none;}' +
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
            '@media(max-width:1280px){.hps-card{flex-basis:19.6em}.hps-screen{padding-top:1.25em}}' +
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
        return {
            name: item.name || item.title || 'Без названия',
            descr: item.descr || item.description || '',
            version: item.version || '1.0.0',
            author: item.author || '@lampa',
            cover: item.cover || item.img || item.image || '',
            store: item.store || '',
            url: item.link || item.url || ''
        };
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
                var store = $('[data-component="' + COMPONENT + '"].settings-param.selector:visible').first();
                var target = $();

                if (store.length) {
                    target = store.nextAll('.settings-param.selector:visible').not('[data-component="' + COMPONENT + '"]').first();
                    if (!target.length) target = store.prevAll('.settings-param.selector:visible').not('[data-component="' + COMPONENT + '"]').first();
                }

                if (!target.length) {
                    target = $('.settings-param.selector:visible').not('[data-component="' + COMPONENT + '"]').first();
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
            card.find('.hps-hint').text('Остаёмся в магазине');
        } else if (state == 'installed') {
            card.addClass('hps-card--installed');
            card.find('.hps-install').text('Установлен');
            card.find('.hps-hint').text('Плагин уже в памяти Lampa');
        } else if (state == 'disabled') {
            card.addClass('hps-card--disabled');
            card.find('.hps-install').text('Отключен');
            card.find('.hps-hint').text('Можно включить в действиях');
        } else {
            card.find('.hps-install').text('Установить');
            card.find('.hps-hint').text('OK — установить');
        }
    }

    function savePluginFallback(data) {
        var list = installedPlugins().map(function (item) {
            return typeof item == 'string' ? { url: item, status: 1 } : item;
        });

        list.push(data);
        Lampa.Storage.set('plugins', list);

        if (Lampa.Utils && typeof Lampa.Utils.putScriptAsync === 'function') {
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
        updateCardState(card, plugin, 'installing');

        var data = {
            url: url,
            status: 1,
            name: plugin.name,
            author: plugin.author
        };

        try {
            if (Lampa.Plugins && typeof Lampa.Plugins.add === 'function') {
                Lampa.Plugins.add(data);
            } else if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
                savePluginFallback(data);
            } else {
                throw new Error('Lampa.Plugins.add не найден');
            }

            setTimeout(function () {
                installing[url] = false;
                updateCardState(card, plugin, 'installed');
                if (complete) complete(true);
            }, 350);
        } catch (e) {
            installing[url] = false;
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
                var card = $('<div class="hps-card selector' + (plugin.cover ? ' hps-card--cover' : '') + '">' +
                    '<div class="hps-cover">' + (plugin.cover ? '<img src="' + escapeHtml(plugin.cover) + '" alt="">' : '') + '</div>' +
                    '<div class="hps-name">' + escapeHtml(plugin.name) + '</div>' +
                    '<div class="hps-desc">' + escapeHtml(plugin.descr) + '</div>' +
                    '<div class="hps-meta">' + escapeHtml(plugin.author) + ' • v' + escapeHtml(plugin.version) + '</div>' +
                    '<div class="hps-card-footer">' +
                        '<div class="hps-install">Установить</div>' +
                        '<div class="hps-hint">OK — установить</div>' +
                    '</div>' +
                '</div>');

                updateCardState(card, plugin);

                card.on('hover:enter click', function (e) {
                    stopEvent(e);
                    if (isInstalled(plugin)) openActionMenu(plugin, card);
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
        });

        setupFocus();
    }

    function focusables() {
        return active ? active.find('.selector:visible') : $();
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
        var index = focusables().index(element);
        if (index > -1) setFocus(index);
    }

    function fallbackMove(direction) {
        var list = focusables();

        if (direction == 'left' || direction == 'up') {
            setFocus(focusIndex - 1);
        } else if (direction == 'right' || direction == 'down') {
            setFocus(Math.min(list.length - 1, focusIndex + 1));
        }
    }

    function moveFocus(direction) {
        var list = focusables();
        var current = list.eq(focusIndex);

        if (!list.length) return;
        if (!current.length) {
            setFocus(0);
            return;
        }

        if (direction == 'down' && current.hasClass('hps-topbtn')) {
            var firstCard = active.find('.hps-card.selector:visible').first();
            var firstCardIndex = list.index(firstCard);

            if (firstCardIndex > -1) {
                setFocus(firstCardIndex);
                return;
            }
        }

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

        var top = 0;
        var node = el[0];

        while (node && node !== scroll && node !== document.body) {
            top += node.offsetTop || 0;
            node = node.offsetParent;
        }

        var bottom = top + el[0].offsetHeight;
        var viewTop = scroll.scrollTop;
        var viewBottom = viewTop + scroll.clientHeight;

        if (top < viewTop + 30) scroll.scrollTop = Math.max(0, top - 40);
        else if (bottom > viewBottom - 30) scroll.scrollTop = bottom - scroll.clientHeight + 40;

        var row = el.closest('.hps-grid')[0];
        if (!row) return;

        var rowRect = row.getBoundingClientRect();
        var itemRect = el[0].getBoundingClientRect();

        if (itemRect.left < rowRect.left + 24) row.scrollLeft -= (rowRect.left + 32) - itemRect.left;
        else if (itemRect.right > rowRect.right - 24) row.scrollLeft += itemRect.right - (rowRect.right - 32);
    }

    function bindKeys() {
        if (keyBound) return;
        keyBound = true;

        $(document).on('keydown.home_plugins_store_clean_v4', function (e) {
            if (!active) return;

            var code = e.keyCode || e.which;

            if (code == 37) {
                stopEvent(e);
                if (actionPanel) moveAction('left');
                else moveFocus('left');
            } else if (code == 39) {
                stopEvent(e);
                if (actionPanel) moveAction('right');
                else moveFocus('right');
            } else if (code == 38) {
                stopEvent(e);
                if (actionPanel) moveAction('up');
                else moveFocus('up');
            } else if (code == 40) {
                stopEvent(e);
                if (actionPanel) moveAction('down');
                else moveFocus('down');
            } else if (code == 13) {
                stopEvent(e);
                if (actionPanel) {
                    selectAction();
                } else {
                    var el = focusables().eq(focusIndex);
                    if (el.length) el.trigger('hover:enter');
                }
            } else if (code == 8 || code == 27 || code == 461 || code == 10009) {
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

        try {
            if (Lampa.Controller) Lampa.Controller.collectionSet(active);
        } catch (e) {}

        setTimeout(function () { setFocus(0); }, 60);
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

    function addSettingsItem(body) {
        addCss();

        if (!Lampa.Settings || !Lampa.Settings.main) return;

        try {
            var main = Lampa.Settings.main();
            var render = body && body.length ? body : main.render();

            if (!render || !render.length || typeof render.find !== 'function') return;
            if (render.find('[data-component="' + COMPONENT + '"]').length) {
                bindSettingsItem(render);
                return;
            }

            var field = $(
                '<div class="settings-param selector" data-component="' + COMPONENT + '">' +
                    '<div class="settings-param__icon">' + smallIcon() + '</div>' +
                    '<div class="settings-param__body">' +
                        '<div class="settings-param__name">' + Lampa.Lang.translate('home_plugins_store_title') + '</div>' +
                        '<div class="settings-param__descr">' + Lampa.Lang.translate('home_plugins_store_descr') + '</div>' +
                    '</div>' +
                '</div>'
            );

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
