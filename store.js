/*
 * name: Дом плагинов
 * author: shardice
 * version: 1.7.0
 * description: Бесплатные плагины для Lampa без подписки. Автоматически читает extensions.json
 */

(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json?v=170';
    var STORE_NAME = 'Дом плагинов';
    var STORE_DESC = 'Бесплатные плагины без подписки';

    var loadedPlugins = [];
    var loadedSections = [];
    var isLoading = false;

    var FALLBACK_PLUGINS = [
        {
            id: 'record_radio',
            title: 'Radio Record',
            subtitle: 'Радио в основном меню',
            description: 'Красивый раздел Radio Record: каналы, фильтры, избранное и аккуратный плеер.',
            author: '@shardice',
            version: '1.2.0',
            tag: 'Music',
            accent: '#ff4757',
            icon: 'REC',
            cover: 'radio',
            url: 'https://shardice.github.io/lampa-store/plugins/record-radio.js?v=120'
        },
        {
            id: 'reload_lampa',
            title: 'Reload Button',
            subtitle: 'Перезагрузка после аккаунта',
            description: 'Кнопка быстрой перезагрузки Lampa в верхней панели после иконки аккаунта.',
            author: '@shardice',
            version: '1.1.0',
            tag: 'System',
            accent: '#00ffd0',
            icon: '↻',
            cover: 'system',
            url: 'https://shardice.github.io/lampa-store/plugins/reload-button.js?v=110'
        },
        {
            id: 'movie_statuses',
            title: 'Статусы фильмов',
            subtitle: 'Медиатека без премиума',
            description: 'Статусы прямо в карточке фильма и в панели избранного. Без отдельного пункта в настройках.',
            author: '@shardice',
            version: '1.1.0',
            tag: 'Library',
            accent: '#7c5cff',
            icon: '✓',
            cover: 'statuses',
            url: 'https://shardice.github.io/lampa-store/plugins/movie-statuses.js?v=110'
        }
    ];

    Lampa.Lang.add({
        plugin_home_title: { ru: STORE_NAME, en: 'Plugin Home', uk: 'Дім плагінів' },
        plugin_home_descr: { ru: STORE_DESC, en: 'Free plugins without subscription', uk: 'Безкоштовні плагіни без підписки' }
    });

    function css() {
        if ($('#plugin-home-style-v170').length) return;

        $('body').append('<style id="plugin-home-style-v170">' +
            '[data-component="plugin_home_store"]{display:flex!important;align-items:center!important;gap:1em!important;min-height:4.7em!important;padding-top:.65em!important;padding-bottom:.65em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon{width:2.35em!important;height:2.35em!important;min-width:2.35em!important;max-width:2.35em!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;margin:0!important;flex:0 0 2.35em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon svg{width:2.1em!important;height:2.1em!important;display:block!important;}' +
            '[data-component="plugin_home_store"] .settings-param__body{display:block!important;min-width:0!important;overflow:hidden!important;}' +
            '[data-component="plugin_home_store"] .settings-param__name{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.15!important;}' +
            '[data-component="plugin_home_store"] .settings-param__descr{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.2!important;}' +

            '.plugin-home{position:fixed;left:0;right:0;top:0;bottom:0;z-index:999999;background:radial-gradient(circle at 18% 12%,rgba(0,255,208,.20),transparent 28%),radial-gradient(circle at 85% 2%,rgba(124,92,255,.20),transparent 30%),linear-gradient(135deg,rgba(12,16,25,.985),rgba(20,24,34,.975));color:#fff;padding:4.05em 4.45em;overflow:hidden;}' +
            '.plugin-home:before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,#00ffd0,#7c5cff,transparent);opacity:.9;}' +
            '.plugin-home__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.35em;position:relative;z-index:2;}' +
            '.plugin-home__brand{display:flex;align-items:center;gap:1.15em;}' +
            '.plugin-home__logo{width:4.55em;height:4.55em;border-radius:1.25em;background:linear-gradient(135deg,#00ffd0,#7c5cff);display:flex;align-items:center;justify-content:center;font-size:2.05em;font-weight:900;box-shadow:0 1.2em 3em rgba(0,255,208,.16);}' +
            '.plugin-home__title{font-size:2.45em;font-weight:900;line-height:1.05;letter-spacing:-.035em;white-space:nowrap;}' +
            '.plugin-home__desc{margin-top:.35em;color:rgba(255,255,255,.66);font-size:1.03em;white-space:nowrap;}' +
            '.plugin-home__actions{display:flex;align-items:center;gap:.7em;}' +
            '.plugin-home__btn{padding:.82em 1.05em;border-radius:1em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);font-weight:800;white-space:nowrap;}' +
            '.plugin-home__btn.focus,.plugin-home__btn.hover{box-shadow:0 0 0 3px rgba(255,255,255,.17);}' +
            '.plugin-home__scroll{height:calc(100% - 6.1em);overflow:auto;position:relative;z-index:2;padding-right:.4em;}' +
            '.plugin-section{margin-bottom:1.35em;}' +
            '.plugin-section__title{font-size:1.18em;font-weight:900;margin:.25em 0 .85em;color:rgba(255,255,255,.9);}' +
            '.plugin-home__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.05em;}' +

            '.plugin-card{position:relative;min-height:19.4em;padding:1.15em;border-radius:1.55em;background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.058));border:1px solid rgba(255,255,255,.13);box-shadow:0 1.2em 3.2em rgba(0,0,0,.28);overflow:hidden;}' +
            '.plugin-card:before{content:"";position:absolute;right:-2.5em;top:-2.5em;width:9em;height:9em;border-radius:50%;background:var(--accent);opacity:.18;filter:blur(.2em);}' +
            '.plugin-cover{position:relative;height:7em;border-radius:1.25em;background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.16));display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);}' +
            '.plugin-cover:before{content:"";position:absolute;inset:-30%;background:radial-gradient(circle at 28% 22%,rgba(255,255,255,.44),transparent 18%),radial-gradient(circle at 75% 10%,rgba(255,255,255,.18),transparent 22%),linear-gradient(135deg,transparent,rgba(0,0,0,.22));}' +
            '.plugin-cover__icon{position:relative;width:3.4em;height:3.4em;border-radius:1em;background:rgba(10,14,22,.45);display:flex;align-items:center;justify-content:center;font-size:1.35em;font-weight:900;color:#fff;box-shadow:0 .7em 1.8em rgba(0,0,0,.22);}' +
            '.plugin-card__tag{position:absolute;right:1.1em;top:1.1em;padding:.42em .66em;border-radius:99em;background:rgba(255,255,255,.18);color:#fff;font-size:.78em;font-weight:800;z-index:3;}' +
            '.plugin-card__title{position:relative;margin-top:.95em;font-size:1.25em;font-weight:900;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__sub{position:relative;margin-top:.28em;color:var(--accent);font-size:.9em;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__text{position:relative;margin-top:.72em;color:rgba(255,255,255,.68);line-height:1.32;font-size:.87em;height:4.55em;overflow:hidden;}' +
            '.plugin-card__meta{position:relative;margin-top:.75em;color:rgba(255,255,255,.46);font-size:.76em;}' +
            '.plugin-card__hint{position:relative;margin-top:.75em;padding:.64em .78em;border-radius:.85em;background:rgba(255,255,255,.08);color:rgba(255,255,255,.72);font-size:.78em;font-weight:800;}' +
            '.plugin-empty{padding:2em;border-radius:1.4em;background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);font-weight:800;}' +
            '.plugin-home .selector.focus,.plugin-home .selector.hover{transform:translateY(-.08em);box-shadow:0 0 0 3px rgba(255,255,255,.17),0 1.4em 3em rgba(0,0,0,.35);}' +
            '@media(max-width:1350px){.plugin-home__grid{grid-template-columns:repeat(3,1fr)}}' +
            '@media(max-width:1100px){.plugin-home__grid{grid-template-columns:repeat(2,1fr)}.plugin-home{padding:3.3em 3.3em}}' +
        '</style>');
    }

    function storeIcon() {
        return '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs><linearGradient id="phg170" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00ffd0"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs>' +
            '<rect x="5" y="5" width="32" height="32" rx="9" fill="url(#phg170)"/>' +
            '<path d="M13.5 22.5h15M13.5 17h15M13.5 28h10" stroke="#fff" stroke-width="2.7" stroke-linecap="round"/>' +
            '<circle cx="30" cy="28" r="3" fill="#fff"/>' +
        '</svg>';
    }

    function inferTag(title, section) {
        var t = (title + ' ' + section).toLowerCase();
        if (t.indexOf('radio') > -1 || t.indexOf('music') > -1 || t.indexOf('музык') > -1) return 'Music';
        if (t.indexOf('reload') > -1 || t.indexOf('system') > -1 || t.indexOf('систем') > -1) return 'System';
        if (t.indexOf('статус') > -1 || t.indexOf('status') > -1) return 'Library';
        if (t.indexOf('ui') > -1 || t.indexOf('интерф') > -1) return 'UI';
        return 'Plugin';
    }

    function inferAccent(tag, index) {
        var colors = ['#00ffd0', '#7c5cff', '#ff4757', '#ffcc66', '#54a0ff', '#1dd1a1', '#f368e0'];
        if (tag == 'Music') return '#ff4757';
        if (tag == 'System') return '#00ffd0';
        if (tag == 'Library') return '#7c5cff';
        if (tag == 'UI') return '#ffcc66';
        return colors[index % colors.length];
    }

    function inferIcon(title, tag) {
        var t = (title || '').toLowerCase();
        if (t.indexOf('radio') > -1) return 'REC';
        if (t.indexOf('reload') > -1) return '↻';
        if (t.indexOf('статус') > -1 || t.indexOf('status') > -1) return '✓';
        if (t.indexOf('очист') > -1 || t.indexOf('ui') > -1) return '✦';
        return '＋';
    }

    function normalizePlugin(item, sectionTitle, index) {
        var title = item.name || item.title || 'Без названия';
        var tag = item.tag || inferTag(title, sectionTitle);
        var accent = item.accent || inferAccent(tag, index);

        return {
            id: item.id || String(title).toLowerCase().replace(/\s+/g, '_'),
            title: title,
            subtitle: item.subtitle || sectionTitle || 'Плагин',
            description: item.descr || item.description || 'Описание не указано',
            author: item.author || '@lampa',
            version: item.version || '1.0.0',
            tag: tag,
            accent: accent,
            icon: item.icon || inferIcon(title, tag),
            cover: item.cover || tag.toLowerCase(),
            url: item.link || item.url || ''
        };
    }

    function parseStoreJson(data) {
        var sections = [];

        if (data && data.results && Array.isArray(data.results)) {
            data.results.forEach(function (section) {
                var sectionTitle = section.title || 'Плагины';
                var list = section.results || section.items || [];

                if (!Array.isArray(list)) return;

                sections.push({
                    title: sectionTitle,
                    plugins: list.map(function (item, index) {
                        return normalizePlugin(item, sectionTitle, index);
                    }).filter(function (plugin) {
                        return !!plugin.url;
                    })
                });
            });
        }

        sections = sections.filter(function (section) {
            return section.plugins.length;
        });

        return sections;
    }

    function flattenSections(sections) {
        var out = [];

        sections.forEach(function (section) {
            section.plugins.forEach(function (plugin) {
                out.push(plugin);
            });
        });

        return out;
    }

    function loadStoreData(callback) {
        if (isLoading) return;
        isLoading = true;

        fetch(STORE_URL + '&_=' + Date.now())
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                var sections = parseStoreJson(data);

                if (!sections.length) {
                    sections = [{ title: 'Дом плагинов', plugins: FALLBACK_PLUGINS }];
                }

                loadedSections = sections;
                loadedPlugins = flattenSections(sections);
                isLoading = false;

                if (callback) callback(sections);
            })
            .catch(function (e) {
                console.log('Plugin Home load store error:', e);

                loadedSections = [{ title: 'Дом плагинов', plugins: FALLBACK_PLUGINS }];
                loadedPlugins = FALLBACK_PLUGINS;
                isLoading = false;

                if (callback) callback(loadedSections);
            });
    }

    function loadScript(url, cb) {
        var clean = url.split('?')[0];
        var old = document.querySelector('script[data-plugin-home-url="' + clean + '"]');
        if (old) old.remove();

        var script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.dataset.pluginHomeUrl = clean;
        script.onload = function () {
            if (Lampa.Noty) Lampa.Noty.show('Применено');
            if (cb) cb(true);
        };
        script.onerror = function () {
            if (Lampa.Noty) Lampa.Noty.show('Не удалось загрузить плагин');
            if (cb) cb(false);
        };

        document.body.appendChild(script);
    }

    function callExtensionMethod(names, plugin) {
        if (!Lampa.Extensions) return false;

        for (var i = 0; i < names.length; i++) {
            try {
                if (typeof Lampa.Extensions[names[i]] == 'function') {
                    Lampa.Extensions[names[i]](plugin.url);
                    return true;
                }
            } catch (e) {
                console.log('Plugin Home method failed:', names[i], e);
            }
        }

        return false;
    }

    function installPlugin(plugin) {
        var done = callExtensionMethod(['install', 'add', 'addPlugin', 'append'], plugin);

        if (done) {
            if (Lampa.Noty) Lampa.Noty.show('Установка: ' + plugin.title);
            return;
        }

        loadScript(plugin.url);
    }

    function removePlugin(plugin) {
        var done = callExtensionMethod(['remove', 'delete', 'uninstall'], plugin);

        if (done) {
            if (Lampa.Noty) Lampa.Noty.show('Удаление: ' + plugin.title);
            return;
        }

        if (Lampa.Noty) Lampa.Noty.show('Открою системный список для удаления');
        openNativeStore();
    }

    function openNativeStore() {
        if (Lampa.Extensions && typeof Lampa.Extensions.show == 'function') {
            Lampa.Extensions.show({
                store: STORE_URL,
                with_installed: true
            });
        }
    }

    function openPluginMenu(plugin) {
        Lampa.Select.show({
            title: plugin.title,
            items: [
                { title: 'Применить сейчас', subtitle: 'Запустить без перезагрузки', action: 'apply' },
                { title: 'Установить / обновить', subtitle: plugin.url, action: 'install' },
                { title: 'Удалить', subtitle: 'Если сборка Lampa поддерживает удаление через API', action: 'remove' },
                { title: 'Открыть системный список', subtitle: 'Запасной вариант установки/удаления', action: 'native' }
            ],
            onSelect: function (item) {
                if (item.action == 'apply') loadScript(plugin.url);
                if (item.action == 'install') installPlugin(plugin);
                if (item.action == 'remove') removePlugin(plugin);
                if (item.action == 'native') openNativeStore();
            }
        });
    }

    function renderSections(container, sections) {
        var scroll = container.find('.plugin-home__scroll');
        scroll.empty();

        if (!sections.length) {
            scroll.append('<div class="plugin-empty">Не удалось загрузить список плагинов</div>');
            return;
        }

        sections.forEach(function (section) {
            var sec = $('<div class="plugin-section">' +
                '<div class="plugin-section__title">' + section.title + '</div>' +
                '<div class="plugin-home__grid"></div>' +
            '</div>');

            section.plugins.forEach(function (plugin) {
                var card = $('<div class="plugin-card selector" style="--accent:' + plugin.accent + '">' +
                    '<div class="plugin-card__tag">' + plugin.tag + '</div>' +
                    '<div class="plugin-cover plugin-cover--' + plugin.cover + '">' +
                        '<div class="plugin-cover__icon">' + plugin.icon + '</div>' +
                    '</div>' +
                    '<div class="plugin-card__title">' + plugin.title + '</div>' +
                    '<div class="plugin-card__sub">' + plugin.subtitle + '</div>' +
                    '<div class="plugin-card__text">' + plugin.description + '</div>' +
                    '<div class="plugin-card__meta">' + plugin.author + ' • v' + plugin.version + '</div>' +
                    '<div class="plugin-card__hint">OK — действия: применить, установить, удалить</div>' +
                '</div>');

                card.on('hover:enter click', function () {
                    openPluginMenu(plugin);
                });

                sec.find('.plugin-home__grid').append(card);
            });

            scroll.append(sec);
        });

        if (Lampa.Controller) {
            Lampa.Controller.collectionSet(container);
            Lampa.Controller.collectionFocus(container.find('.selector').eq(2));
        }
    }

    function openStore() {
        css();

        $('.plugin-home').remove();

        var html = $('<div class="plugin-home">' +
            '<div class="plugin-home__head">' +
                '<div class="plugin-home__brand">' +
                    '<div class="plugin-home__logo">⌂</div>' +
                    '<div>' +
                        '<div class="plugin-home__title">' + STORE_NAME + '</div>' +
                        '<div class="plugin-home__desc">' + STORE_DESC + '. Новые плагины подтягиваются из extensions.json.</div>' +
                    '</div>' +
                '</div>' +
                '<div class="plugin-home__actions">' +
                    '<div class="plugin-home__btn selector" data-action="refresh">Обновить</div>' +
                    '<div class="plugin-home__btn selector" data-action="system">Список</div>' +
                    '<div class="plugin-home__btn selector" data-action="close">Закрыть</div>' +
                '</div>' +
            '</div>' +
            '<div class="plugin-home__scroll"><div class="plugin-empty">Загрузка плагинов...</div></div>' +
        '</div>');

        html.find('[data-action="close"]').on('hover:enter click', closeStore);
        html.find('[data-action="system"]').on('hover:enter click', openNativeStore);
        html.find('[data-action="refresh"]').on('hover:enter click', function () {
            html.find('.plugin-home__scroll').html('<div class="plugin-empty">Обновляю список...</div>');
            loadStoreData(function (sections) {
                renderSections(html, sections);
                if (Lampa.Noty) Lampa.Noty.show('Список обновлён');
            });
        });

        $('body').append(html);

        if (Lampa.Controller) {
            Lampa.Controller.add('plugin_home_store', {
                toggle: function () {},
                update: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(html.find('.selector').eq(0));
                },
                left: function () { Lampa.Controller.collectionFocus(false, html); },
                right: function () { Lampa.Controller.collectionFocus(false, html); },
                up: function () { Lampa.Controller.collectionFocus(false, html); },
                down: function () { Lampa.Controller.collectionFocus(false, html); },
                back: closeStore
            });

            Lampa.Controller.toggle('plugin_home_store');
        }

        loadStoreData(function (sections) {
            renderSections(html, sections);
        });
    }

    function closeStore() {
        $('.plugin-home').remove();

        if (Lampa.Controller) {
            Lampa.Controller.toggle('settings');
        }
    }

    function addStoreButton() {
        css();

        if (!Lampa.Settings || !Lampa.Settings.main) return;

        var settings = Lampa.Settings.main();
        var render = settings.render();

        if (render.find('[data-component="plugin_home_store"]').length) return;
        render.find('[data-component="shardice_store"]').remove();

        var field = $(
            '<div class="settings-param selector" data-component="plugin_home_store">' +
                '<div class="settings-param__icon">' + storeIcon() + '</div>' +
                '<div class="settings-param__body">' +
                    '<div class="settings-param__name">' + Lampa.Lang.translate('plugin_home_title') + '</div>' +
                    '<div class="settings-param__descr">' + Lampa.Lang.translate('plugin_home_descr') + '</div>' +
                '</div>' +
            '</div>'
        );

        var after = render.find('[data-component="more"], [data-component="extensions"], [data-component="plugins"]').first();

        if (after.length) after.after(field);
        else render.append(field);

        settings.update();
    }

    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'main') {
            e.body.find('[data-component="plugin_home_store"]').off('hover:enter').on('hover:enter', openStore);
        }
    });

    if (window.appready) addStoreButton();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addStoreButton();
        });
    }
})();
