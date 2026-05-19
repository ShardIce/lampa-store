/*
 * name: Дом плагинов
 * author: shardice
 * version: 1.8.0
 * description: Бесплатные плагины для Lampa. Автокаталог, cover-обложки, кнопки установки и управление с пульта
 */

(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json?v=180';
    var STORE_NAME = 'Дом плагинов';
    var STORE_DESC = 'Бесплатные плагины без подписки';

    var controllerName = 'plugin_home_store_v180';
    var activeRoot = null;
    var installedIndex = {};
    var loadedSections = [];
    var keyHandlerBound = false;

    var FALLBACK_SECTIONS = [{
        title: 'Дом плагинов',
        plugins: [
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
                cover: 'https://shardice.github.io/lampa-store/covers/record-radio.svg?v=180',
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
                cover: 'https://shardice.github.io/lampa-store/covers/reload-button.svg?v=180',
                url: 'https://shardice.github.io/lampa-store/plugins/reload-button.js?v=110'
            },
            {
                id: 'movie_statuses',
                title: 'Статусы фильмов',
                subtitle: 'Медиатека без премиума',
                description: 'Статусы прямо в карточке фильма и в панели избранного.',
                author: '@shardice',
                version: '1.1.0',
                tag: 'Library',
                accent: '#7c5cff',
                icon: '✓',
                cover: 'https://shardice.github.io/lampa-store/covers/movie-statuses.svg?v=180',
                url: 'https://shardice.github.io/lampa-store/plugins/movie-statuses.js?v=110'
            }
        ]
    }];

    Lampa.Lang.add({
        plugin_home_title: { ru: STORE_NAME, en: 'Plugin Home', uk: 'Дім плагінів' },
        plugin_home_descr: { ru: STORE_DESC, en: 'Free plugins without subscription', uk: 'Безкоштовні плагіни без підписки' }
    });

    function css() {
        if ($('#plugin-home-style-v180').length) return;

        $('body').append('<style id="plugin-home-style-v180">' +
            '[data-component="plugin_home_store"]{display:flex!important;align-items:center!important;gap:1em!important;min-height:4.7em!important;padding-top:.65em!important;padding-bottom:.65em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon{width:2.35em!important;height:2.35em!important;min-width:2.35em!important;max-width:2.35em!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;margin:0!important;flex:0 0 2.35em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon svg{width:2.1em!important;height:2.1em!important;display:block!important;}' +
            '[data-component="plugin_home_store"] .settings-param__body{display:block!important;min-width:0!important;overflow:hidden!important;}' +
            '[data-component="plugin_home_store"] .settings-param__name{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.15!important;}' +
            '[data-component="plugin_home_store"] .settings-param__descr{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.2!important;}' +

            '.plugin-home{position:fixed;left:0;right:0;top:0;bottom:0;z-index:999999;background:radial-gradient(circle at 18% 12%,rgba(0,255,208,.20),transparent 28%),radial-gradient(circle at 85% 2%,rgba(124,92,255,.20),transparent 30%),linear-gradient(135deg,rgba(12,16,25,.985),rgba(20,24,34,.975));color:#fff;padding:4.05em 4.45em;overflow:hidden;}' +
            '.plugin-home:before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,#00ffd0,#7c5cff,transparent);opacity:.9;}' +
            '.plugin-home__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.15em;position:relative;z-index:2;}' +
            '.plugin-home__brand{display:flex;align-items:center;gap:1.15em;min-width:0;}' +
            '.plugin-home__logo{width:4.55em;height:4.55em;border-radius:1.25em;background:linear-gradient(135deg,#00ffd0,#7c5cff);display:flex;align-items:center;justify-content:center;font-size:2.05em;font-weight:900;box-shadow:0 1.2em 3em rgba(0,255,208,.16);flex:0 0 auto;}' +
            '.plugin-home__title{font-size:2.45em;font-weight:900;line-height:1.05;letter-spacing:-.035em;white-space:nowrap;}' +
            '.plugin-home__desc{margin-top:.35em;color:rgba(255,255,255,.66);font-size:1.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-home__actions{display:flex;align-items:center;gap:.7em;}' +
            '.plugin-home__btn{padding:.82em 1.05em;border-radius:1em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);font-weight:800;white-space:nowrap;}' +
            '.plugin-home__btn.focus,.plugin-home__btn.hover{box-shadow:0 0 0 3px rgba(255,255,255,.17);}' +
            '.plugin-home__scroll{height:calc(100% - 5.9em);overflow:auto;position:relative;z-index:2;padding-right:.4em;scroll-behavior:smooth;}' +
            '.plugin-section{margin-bottom:1.35em;}' +
            '.plugin-section__title{font-size:1.18em;font-weight:900;margin:.25em 0 .85em;color:rgba(255,255,255,.9);}' +
            '.plugin-home__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.05em;}' +

            '.plugin-card{position:relative;min-height:21.7em;padding:1.05em;border-radius:1.55em;background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.058));border:1px solid rgba(255,255,255,.13);box-shadow:0 1.2em 3.2em rgba(0,0,0,.28);overflow:hidden;}' +
            '.plugin-card:before{content:"";position:absolute;right:-2.5em;top:-2.5em;width:9em;height:9em;border-radius:50%;background:var(--accent);opacity:.16;filter:blur(.2em);}' +
            '.plugin-cover{position:relative;height:7.6em;border-radius:1.25em;background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.16));background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);}' +
            '.plugin-cover:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.18));}' +
            '.plugin-cover__icon{position:relative;z-index:2;width:3.35em;height:3.35em;border-radius:1em;background:rgba(10,14,22,.42);display:flex;align-items:center;justify-content:center;font-size:1.22em;font-weight:900;color:#fff;box-shadow:0 .7em 1.8em rgba(0,0,0,.22);}' +
            '.plugin-card__tag{position:absolute;right:1em;top:1em;padding:.42em .66em;border-radius:99em;background:rgba(255,255,255,.18);color:#fff;font-size:.76em;font-weight:800;z-index:3;}' +
            '.plugin-card__title{position:relative;margin-top:.82em;font-size:1.22em;font-weight:900;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__sub{position:relative;margin-top:.26em;color:var(--accent);font-size:.88em;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__text{position:relative;margin-top:.65em;color:rgba(255,255,255,.68);line-height:1.30;font-size:.84em;height:3.55em;overflow:hidden;}' +
            '.plugin-card__meta{position:relative;margin-top:.65em;color:rgba(255,255,255,.46);font-size:.75em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__actions{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:.55em;margin-top:.82em;}' +
            '.plugin-card__action{height:2.55em;border-radius:.78em;display:flex;align-items:center;justify-content:center;font-size:.82em;font-weight:900;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.11);}' +
            '.plugin-card__action--install{background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.22));color:#101018;}' +
            '.plugin-card__action--delete{background:rgba(255,90,90,.14);}' +
            '.plugin-installed{position:absolute;left:1em;top:1em;z-index:4;padding:.42em .62em;border-radius:99em;background:rgba(0,255,208,.19);border:1px solid rgba(0,255,208,.3);font-size:.74em;font-weight:900;color:#cffff6;}' +
            '.plugin-empty{padding:2em;border-radius:1.4em;background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);font-weight:800;}' +
            '.plugin-home .selector.focus,.plugin-home .selector.hover{transform:translateY(-.08em);box-shadow:0 0 0 3px rgba(255,255,255,.17),0 1.4em 3em rgba(0,0,0,.35);}' +
            '.plugin-home .plugin-card__action.focus,.plugin-home .plugin-card__action.hover{transform:none;box-shadow:0 0 0 2px rgba(255,255,255,.22);}' +
            '@media(max-width:1450px){.plugin-home__grid{grid-template-columns:repeat(3,1fr)}}' +
            '@media(max-width:1120px){.plugin-home__grid{grid-template-columns:repeat(2,1fr)}.plugin-home{padding:3.3em 3.3em}}' +
        '</style>');
    }

    function storeIcon() {
        return '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs><linearGradient id="phg180" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00ffd0"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs>' +
            '<rect x="5" y="5" width="32" height="32" rx="9" fill="url(#phg180)"/>' +
            '<path d="M13.5 22.5h15M13.5 17h15M13.5 28h10" stroke="#fff" stroke-width="2.7" stroke-linecap="round"/>' +
            '<circle cx="30" cy="28" r="3" fill="#fff"/>' +
        '</svg>';
    }

    function normalizeUrl(url) {
        return String(url || '').split('?')[0];
    }

    function refreshInstalledIndex() {
        installedIndex = {};

        try {
            var ext = Lampa.Storage.get('extensions') || Lampa.Storage.get('plugins') || {};
            var raw = JSON.stringify(ext);

            loadedSections.forEach(function (section) {
                section.plugins.forEach(function (plugin) {
                    if (raw.indexOf(normalizeUrl(plugin.url)) > -1 || raw.indexOf(plugin.url) > -1) installedIndex[normalizeUrl(plugin.url)] = true;
                });
            });
        } catch (e) {}

        $('.plugin-card').each(function () {
            var card = $(this);
            var url = card.attr('data-url');

            if (installedIndex[normalizeUrl(url)]) {
                if (!card.find('.plugin-installed').length) card.append('<div class="plugin-installed">Установлен</div>');
            } else {
                card.find('.plugin-installed').remove();
            }
        });
    }

    function inferTag(title, section) {
        var t = (title + ' ' + section).toLowerCase();

        if (t.indexOf('radio') > -1 || t.indexOf('music') > -1 || t.indexOf('музык') > -1) return 'Music';
        if (t.indexOf('reload') > -1 || t.indexOf('system') > -1 || t.indexOf('систем') > -1) return 'System';
        if (t.indexOf('статус') > -1 || t.indexOf('status') > -1) return 'Library';
        if (t.indexOf('ui') > -1 || t.indexOf('интерф') > -1) return 'UI';
        if (t.indexOf('store') > -1 || t.indexOf('дом') > -1) return 'Store';

        return 'Plugin';
    }

    function inferAccent(tag, index) {
        var colors = ['#00ffd0', '#7c5cff', '#ff4757', '#ffcc66', '#54a0ff', '#1dd1a1', '#f368e0'];

        if (tag == 'Music') return '#ff4757';
        if (tag == 'System') return '#00ffd0';
        if (tag == 'Library') return '#7c5cff';
        if (tag == 'UI') return '#ffcc66';
        if (tag == 'Store') return '#00ffd0';

        return colors[index % colors.length];
    }

    function inferIcon(title, tag) {
        var t = (title || '').toLowerCase();

        if (t.indexOf('radio') > -1) return 'REC';
        if (t.indexOf('reload') > -1) return '↻';
        if (t.indexOf('статус') > -1 || t.indexOf('status') > -1) return '✓';
        if (t.indexOf('очист') > -1 || t.indexOf('ui') > -1) return '✦';
        if (t.indexOf('дом') > -1 || t.indexOf('store') > -1) return '⌂';

        return '＋';
    }

    function slugify(text) {
        return String(text || 'plugin').toLowerCase()
            .replace(/https?:\/\//g, '')
            .replace(/[^a-z0-9а-яё]+/gi, '-')
            .replace(/^-+|-+$/g, '');
    }

    function inferCover(item, title) {
        if (item.cover) {
            if (String(item.cover).indexOf('http') == 0) return item.cover;
            return 'https://shardice.github.io/lampa-store/covers/' + item.cover.replace(/^\/+/, '') + '?v=180';
        }

        var link = item.link || item.url || '';
        var file = normalizeUrl(link).split('/').pop() || '';
        var name = file.replace('.js', '') || slugify(title);

        return 'https://shardice.github.io/lampa-store/covers/' + name + '.svg?v=180';
    }

    function normalizePlugin(item, sectionTitle, index) {
        var title = item.name || item.title || 'Без названия';
        var tag = item.tag || inferTag(title, sectionTitle);
        var accent = item.accent || inferAccent(tag, index);

        return {
            id: item.id || slugify(title),
            title: title,
            subtitle: item.subtitle || sectionTitle || 'Плагин',
            description: item.descr || item.description || 'Описание не указано',
            author: item.author || '@lampa',
            version: item.version || '1.0.0',
            tag: tag,
            accent: accent,
            icon: item.icon || inferIcon(title, tag),
            cover: inferCover(item, title),
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

                var plugins = list.map(function (item, index) {
                    return normalizePlugin(item, sectionTitle, index);
                }).filter(function (plugin) {
                    return !!plugin.url;
                });

                if (plugins.length) {
                    sections.push({ title: sectionTitle, plugins: plugins });
                }
            });
        }

        return sections.length ? sections : FALLBACK_SECTIONS;
    }

    function loadStoreData(callback) {
        fetch(STORE_URL + '&_=' + Date.now())
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                loadedSections = parseStoreJson(data);

                if (callback) callback(loadedSections);
            })
            .catch(function (e) {
                console.log('Plugin Home load store error:', e);
                loadedSections = FALLBACK_SECTIONS;

                if (callback) callback(loadedSections);
            });
    }

    function openNativeStore() {
        if (Lampa.Extensions && typeof Lampa.Extensions.show == 'function') {
            Lampa.Extensions.show({
                store: STORE_URL,
                with_installed: true
            });
        }
    }

    function installWithNative(plugin) {
        /*
         * Важно: вручную script не подгружаем.
         * Тут пытаемся использовать именно системные методы Lampa.Extensions,
         * чтобы Lampa сама показала подтверждение/перезагрузку, если сборка это поддерживает.
         */
        var ok = false;

        try {
            if (Lampa.Extensions) {
                if (typeof Lampa.Extensions.install == 'function') {
                    Lampa.Extensions.install(plugin.url);
                    ok = true;
                } else if (typeof Lampa.Extensions.add == 'function') {
                    Lampa.Extensions.add(plugin.url);
                    ok = true;
                } else if (typeof Lampa.Extensions.addPlugin == 'function') {
                    Lampa.Extensions.addPlugin(plugin.url);
                    ok = true;
                } else if (typeof Lampa.Extensions.append == 'function') {
                    Lampa.Extensions.append(plugin.url);
                    ok = true;
                }
            }
        } catch (e) {
            console.log('Plugin Home native install failed:', e);
        }

        if (!ok) {
            /*
             * Если API установки недоступен, открываем родной системный список Lampa.
             * Это лучше, чем тихо подгружать script без сохранения и без перезагрузки.
             */
            openNativeStore();
        }

        setTimeout(refreshInstalledIndex, 800);
    }

    function removeWithNative(plugin) {
        var ok = false;

        try {
            if (Lampa.Extensions) {
                if (typeof Lampa.Extensions.remove == 'function') {
                    Lampa.Extensions.remove(plugin.url);
                    ok = true;
                } else if (typeof Lampa.Extensions.delete == 'function') {
                    Lampa.Extensions.delete(plugin.url);
                    ok = true;
                } else if (typeof Lampa.Extensions.uninstall == 'function') {
                    Lampa.Extensions.uninstall(plugin.url);
                    ok = true;
                }
            }
        } catch (e) {
            console.log('Plugin Home native remove failed:', e);
        }

        if (!ok) openNativeStore();

        setTimeout(refreshInstalledIndex, 800);
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
                var coverCss = plugin.cover ? 'background-image:url(' + plugin.cover + ');' : '';

                var card = $('<div class="plugin-card" style="--accent:' + plugin.accent + '" data-url="' + plugin.url + '">' +
                    '<div class="plugin-card__tag">' + plugin.tag + '</div>' +
                    '<div class="plugin-cover" style="' + coverCss + '">' +
                        '<div class="plugin-cover__icon">' + plugin.icon + '</div>' +
                    '</div>' +
                    '<div class="plugin-card__title">' + plugin.title + '</div>' +
                    '<div class="plugin-card__sub">' + plugin.subtitle + '</div>' +
                    '<div class="plugin-card__text">' + plugin.description + '</div>' +
                    '<div class="plugin-card__meta">' + plugin.author + ' • v' + plugin.version + '</div>' +
                    '<div class="plugin-card__actions">' +
                        '<div class="plugin-card__action plugin-card__action--install selector" data-action="install">Установить</div>' +
                        '<div class="plugin-card__action plugin-card__action--delete selector" data-action="delete">Удалить</div>' +
                    '</div>' +
                '</div>');

                card.find('[data-action="install"]').on('hover:enter click', function (e) {
                    e.stopPropagation();
                    installWithNative(plugin);
                });

                card.find('[data-action="delete"]').on('hover:enter click', function (e) {
                    e.stopPropagation();
                    removeWithNative(plugin);
                });

                sec.find('.plugin-home__grid').append(card);
            });

            scroll.append(sec);
        });

        refreshInstalledIndex();
        refreshController(container);
    }

    function refreshController(container) {
        if (!container || !container.length) return;

        if (Lampa.Controller) {
            Lampa.Controller.collectionSet(container);
        }

        setTimeout(function () {
            var focused = container.find('.selector.focus, .selector.hover').first();

            if (!focused.length) focusElement(container.find('.selector').eq(0));
        }, 60);
    }

    function focusElement(el) {
        if (!activeRoot || !el || !el.length) return;

        activeRoot.find('.selector').removeClass('focus hover');
        el.addClass('focus');

        try {
            el[0].scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } catch (e) {}

        if (Lampa.Controller && typeof Lampa.Controller.collectionFocus == 'function') {
            try { Lampa.Controller.collectionFocus(el); } catch (e2) {}
        }
    }

    function focusByStep(step) {
        if (!activeRoot) return;

        var items = activeRoot.find('.selector:visible');
        if (!items.length) return;

        var current = items.index(activeRoot.find('.selector.focus, .selector.hover').first());
        if (current < 0) current = 0;

        var next = current + step;
        if (next < 0) next = 0;
        if (next >= items.length) next = items.length - 1;

        focusElement(items.eq(next));
    }

    function columnsCount() {
        if (!activeRoot) return 4;

        var first = activeRoot.find('.plugin-home__grid').first();
        if (!first.length) return 4;

        var cols = first.css('grid-template-columns');
        if (!cols) return 4;

        return cols.split(' ').length || 4;
    }

    function bindKeys() {
        if (keyHandlerBound) return;
        keyHandlerBound = true;

        $(document).on('keydown.plugin_home_store_v180', function (e) {
            if (!activeRoot || !activeRoot.length) return;

            var code = e.keyCode || e.which;
            var cols = columnsCount();

            if (code == 37) { e.preventDefault(); focusByStep(-1); }
            if (code == 39) { e.preventDefault(); focusByStep(1); }
            if (code == 38) { e.preventDefault(); focusByStep(-cols); }
            if (code == 40) { e.preventDefault(); focusByStep(cols); }

            if (code == 13) {
                e.preventDefault();
                var focused = activeRoot.find('.selector.focus, .selector.hover').first();
                if (focused.length) focused.trigger('hover:enter').trigger('click');
            }

            if (code == 27 || code == 8 || code == 461 || code == 10009) {
                e.preventDefault();
                closeStore();
            }
        });
    }

    function unbindKeys() {
        keyHandlerBound = false;
        $(document).off('keydown.plugin_home_store_v180');
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
                    '<div class="plugin-home__btn selector" data-action="system">Список Lampa</div>' +
                    '<div class="plugin-home__btn selector" data-action="close">Закрыть</div>' +
                '</div>' +
            '</div>' +
            '<div class="plugin-home__scroll"><div class="plugin-empty">Загрузка плагинов...</div></div>' +
        '</div>');

        activeRoot = html;

        html.find('[data-action="close"]').on('hover:enter click', closeStore);
        html.find('[data-action="system"]').on('hover:enter click', openNativeStore);
        html.find('[data-action="refresh"]').on('hover:enter click', function () {
            html.find('.plugin-home__scroll').html('<div class="plugin-empty">Обновляю список...</div>');

            loadStoreData(function (sections) {
                renderSections(html, sections);
            });
        });

        $('body').append(html);

        if (Lampa.Controller) {
            Lampa.Controller.add(controllerName, {
                toggle: function () {},
                update: function () {
                    refreshController(html);
                },
                left: function () { focusByStep(-1); },
                right: function () { focusByStep(1); },
                up: function () { focusByStep(-columnsCount()); },
                down: function () { focusByStep(columnsCount()); },
                back: closeStore
            });

            Lampa.Controller.toggle(controllerName);
        }

        bindKeys();
        refreshController(html);

        loadStoreData(function (sections) {
            renderSections(html, sections);
        });
    }

    function closeStore() {
        $('.plugin-home').remove();
        activeRoot = null;
        unbindKeys();

        if (Lampa.Controller) {
            /*
             * Возврат именно в настройки, а не в системный список расширений.
             * Это убирает эффект возврата в старую страницу после "Закрыть".
             */
            try { Lampa.Controller.toggle('settings'); } catch (e) {}
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
