/*
 * name: Дом плагинов
 * author: shardice
 * version: 2.1.0
 * description: Автокаталог, PNG-cover, управление пультом и установка через родной экран Lampa
 */

(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json?v=210';
    var STORE_NAME = 'Дом плагинов';
    var STORE_DESC = 'Бесплатные плагины без подписки';
    var COVERS_BASE = 'https://shardice.github.io/lampa-store/covers/';
    var controllerName = 'plugin_home_store_v210';
    var activeRoot = null;
    var loadedSections = [];
    var focusedIndex = 0;
    var keyBound = false;

    Lampa.Lang.add({
        plugin_home_title: { ru: STORE_NAME, en: 'Plugin Home', uk: 'Дім плагінів' },
        plugin_home_descr: { ru: STORE_DESC, en: 'Free plugins without subscription', uk: 'Безкоштовні плагіни без підписки' }
    });

    function css() {
        if ($('#plugin-home-style-v210').length) return;

        $('body').append('<style id="plugin-home-style-v210">' +
            '[data-component="plugin_home_store"]{display:flex!important;align-items:center!important;gap:1em!important;min-height:4.7em!important;padding-top:.65em!important;padding-bottom:.65em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon{width:1.55em!important;height:1.55em!important;min-width:1.55em!important;max-width:1.55em!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;margin:0 .75em 0 0!important;flex:0 0 1.55em!important;border-radius:.38em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon svg{width:1.45em!important;height:1.45em!important;display:block!important;}' +
            '[data-component="plugin_home_store"] svg{max-width:1.45em!important;max-height:1.45em!important;}[data-component="plugin_home_store"] .settings-param__body{min-width:0!important;}[data-component="plugin_home_store"] .settings-param__name,[data-component="plugin_home_store"] .settings-param__descr{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}' +

            '.plugin-home{position:fixed;left:0;right:0;top:0;bottom:0;z-index:999999;background:radial-gradient(circle at 18% 12%,rgba(0,255,208,.20),transparent 28%),radial-gradient(circle at 85% 2%,rgba(124,92,255,.20),transparent 30%),linear-gradient(135deg,rgba(12,16,25,.985),rgba(20,24,34,.975));color:#fff;padding:3.6em 4.1em;overflow:hidden;}' +
            '.plugin-home__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.1em;position:relative;z-index:2;}' +
            '.plugin-home__brand{display:flex;align-items:center;gap:1.05em;min-width:0;}' +
            '.plugin-home__logo{width:4.25em;height:4.25em;border-radius:1.18em;background:linear-gradient(135deg,#00ffd0,#7c5cff);display:flex;align-items:center;justify-content:center;font-size:1.9em;font-weight:900;box-shadow:0 1.2em 3em rgba(0,255,208,.16);flex:0 0 auto;}' +
            '.plugin-home__title{font-size:2.25em;font-weight:900;line-height:1.05;letter-spacing:-.035em;white-space:nowrap;}' +
            '.plugin-home__desc{margin-top:.32em;color:rgba(255,255,255,.66);font-size:.98em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55vw;}' +
            '.plugin-home__actions{display:flex;align-items:center;gap:.65em;}' +
            '.plugin-home__btn{padding:.72em .95em;border-radius:.9em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);font-weight:800;white-space:nowrap;}' +
            '.plugin-home__scroll{height:calc(100% - 5.4em);overflow-y:auto;overflow-x:hidden;position:relative;z-index:2;padding-right:.55em;scroll-behavior:auto;}' +
            '.plugin-section{margin-bottom:1.15em;}' +
            '.plugin-section__title{font-size:1.12em;font-weight:900;margin:.2em 0 .75em;color:rgba(255,255,255,.92);}' +
            '.plugin-home__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.95em;}' +

            '.plugin-card{position:relative;min-height:20.6em;padding:1em;border-radius:1.4em;background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.058));border:1px solid rgba(255,255,255,.13);box-shadow:0 1.2em 3.2em rgba(0,0,0,.28);overflow:hidden;}' +
            '.plugin-card:before{content:"";position:absolute;right:-2.5em;top:-2.5em;width:9em;height:9em;border-radius:50%;background:var(--accent);opacity:.12;filter:blur(.2em);}' +
            '.plugin-cover{position:relative;height:7.35em;border-radius:1.12em;background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.16));overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);}' +
            '.plugin-cover img{width:100%;height:100%;object-fit:cover;display:block;}' +
            '.plugin-card__tag{position:absolute;right:.85em;top:.85em;padding:.38em .6em;border-radius:99em;background:rgba(255,255,255,.18);color:#fff;font-size:.72em;font-weight:800;z-index:3;}' +
            '.plugin-card__title{position:relative;margin-top:.78em;font-size:1.16em;font-weight:900;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__sub{position:relative;margin-top:.22em;color:var(--accent);font-size:.84em;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__text{position:relative;margin-top:.58em;color:rgba(255,255,255,.68);line-height:1.30;font-size:.8em;height:3.15em;overflow:hidden;}' +
            '.plugin-card__meta{position:relative;margin-top:.6em;color:rgba(255,255,255,.46);font-size:.72em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__actions{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:.52em;margin-top:.72em;}' +
            '.plugin-card__action{height:2.42em;border-radius:.72em;display:flex;align-items:center;justify-content:center;font-size:.8em;font-weight:900;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.11);}' +
            '.plugin-card__action--install{background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.22));color:#101018;}' +
            '.plugin-card__action--delete{background:rgba(255,90,90,.14);}' +
            '.plugin-empty{padding:2em;border-radius:1.4em;background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);font-weight:800;}' +
            '.plugin-home .selector.focus,.plugin-home .selector.hover{transform:translateY(-.06em);box-shadow:0 0 0 3px rgba(255,255,255,.22),0 1.2em 2.5em rgba(0,0,0,.35)!important;}' +
            '.plugin-home .plugin-card__action.focus,.plugin-home .plugin-card__action.hover{transform:none!important;box-shadow:0 0 0 2px rgba(255,255,255,.28)!important;}' +
            '@media(max-width:1250px){.plugin-home__grid{grid-template-columns:repeat(2,1fr)}.plugin-home{padding:3.1em 3.1em}}' +
        '</style>');
    }

    function storeIcon() {
        return '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">' +
            '<defs><linearGradient id="phg190" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00ffd0"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs>' +
            '<rect x="5" y="5" width="32" height="32" rx="9" fill="url(#phg190)"/>' +
            '<path d="M13.5 22.5h15M13.5 17h15M13.5 28h10" stroke="#fff" stroke-width="2.7" stroke-linecap="round"/>' +
            '<circle cx="30" cy="28" r="3" fill="#fff"/>' +
        '</svg>';
    }

    function tagFrom(title, section) {
        var t = (title + ' ' + section).toLowerCase();
        if (t.indexOf('radio') > -1) return 'Music';
        if (t.indexOf('reload') > -1 || t.indexOf('system') > -1 || t.indexOf('систем') > -1) return 'System';
        if (t.indexOf('статус') > -1 || t.indexOf('status') > -1) return 'Library';
        if (t.indexOf('очист') > -1 || t.indexOf('ui') > -1) return 'UI';
        if (t.indexOf('дом') > -1 || t.indexOf('store') > -1) return 'Store';
        return 'Plugin';
    }

    function accentFrom(tag, index) {
        var colors = ['#00ffd0', '#7c5cff', '#ff4757', '#ffcc66', '#54a0ff', '#1dd1a1', '#f368e0'];
        if (tag == 'Music') return '#ff4757';
        if (tag == 'System') return '#00ffd0';
        if (tag == 'Library') return '#7c5cff';
        if (tag == 'UI') return '#ffcc66';
        if (tag == 'Store') return '#00ffd0';
        return colors[index % colors.length];
    }

    function coverUrl(item) {
        if (item.cover) {
            if (String(item.cover).indexOf('http') == 0) return item.cover;
            return COVERS_BASE + String(item.cover).replace(/^\/+/, '') + '?v=210';
        }
        return COVERS_BASE + 'plugin-home.png?v=210';
    }

    function normalize(item, sectionTitle, index) {
        var title = item.name || item.title || 'Без названия';
        var tag = item.tag || tagFrom(title, sectionTitle);

        return {
            id: item.id || title,
            title: title,
            subtitle: item.subtitle || sectionTitle || 'Плагин',
            description: item.descr || item.description || 'Описание не указано',
            author: item.author || '@lampa',
            version: item.version || '1.0.0',
            tag: tag,
            accent: item.accent || accentFrom(tag, index),
            icon: item.icon || '＋',
            cover: coverUrl(item),
            url: item.link || item.url || '',
            store: item.store || ''
        };
    }

    function parse(data) {
        var sections = [];

        if (data && Array.isArray(data.results)) {
            data.results.forEach(function (section) {
                var title = section.title || 'Плагины';
                var list = section.results || [];
                var plugins = [];

                if (Array.isArray(list)) {
                    list.forEach(function (item, index) {
                        var plugin = normalize(item, title, index);
                        if (plugin.url) plugins.push(plugin);
                    });
                }

                if (plugins.length) sections.push({ title: title, plugins: plugins });
            });
        }

        return sections;
    }

    function loadCatalog(done) {
        fetch(STORE_URL + '&_=' + Date.now())
            .then(function (r) { return r.json(); })
            .then(function (data) {
                loadedSections = parse(data);
                done(loadedSections);
            })
            .catch(function (e) {
                console.log('Plugin Home catalog error:', e);
                done([]);
            });
    }

    function openNativeStore(store) {
        try {
            if (Lampa.Extensions && typeof Lampa.Extensions.show == 'function') {
                Lampa.Extensions.show({ store: store || STORE_URL, with_installed: true });
                return true;
            }
        } catch (e) {
            console.log('Plugin Home native store error:', e);
        }

        if (Lampa.Noty) Lampa.Noty.show('Родной экран расширений недоступен');
        return false;
    }

    function installNative(plugin) {
        /*
         * Реальная установка и подтверждение должны быть сделаны родным экраном Lampa.
         * Поэтому открываем single-plugin catalog: в нём только выбранный плагин.
         */
        openNativeStore(plugin.store || STORE_URL);
    }

    function deleteNative(plugin) {
        /*
         * Удаление тоже делаем через родной список Lampa, потому что в разных сборках разные storage/API.
         */
        openNativeStore(STORE_URL);
    }

    function render(root, sections) {
        var scroll = root.find('.plugin-home__scroll');
        scroll.empty();

        if (!sections.length) {
            scroll.append('<div class="plugin-empty">Каталог не загрузился. Проверь extensions.json и GitHub Pages.</div>');
            setupFocus(root);
            return;
        }

        sections.forEach(function (section) {
            var sec = $('<div class="plugin-section">' +
                '<div class="plugin-section__title">' + section.title + '</div>' +
                '<div class="plugin-home__grid"></div>' +
            '</div>');

            section.plugins.forEach(function (plugin) {
                var card = $('<div class="plugin-card" style="--accent:' + plugin.accent + '">' +
                    '<div class="plugin-card__tag">' + plugin.tag + '</div>' +
                    '<div class="plugin-cover"><img src="' + plugin.cover + '"></div>' +
                    '<div class="plugin-card__title">' + plugin.title + '</div>' +
                    '<div class="plugin-card__sub">' + plugin.subtitle + '</div>' +
                    '<div class="plugin-card__text">' + plugin.description + '</div>' +
                    '<div class="plugin-card__meta">' + plugin.author + ' • v' + plugin.version + '</div>' +
                    '<div class="plugin-card__actions">' +
                        '<div class="plugin-card__action plugin-card__action--install selector" data-act="install">Установить</div>' +
                        '<div class="plugin-card__action plugin-card__action--delete selector" data-act="delete">Удалить</div>' +
                    '</div>' +
                '</div>');

                card.find('[data-act="install"]').on('hover:enter click', function (e) {
                    e.stopPropagation();
                    installNative(plugin);
                });

                card.find('[data-act="delete"]').on('hover:enter click', function (e) {
                    e.stopPropagation();
                    deleteNative(plugin);
                });

                sec.find('.plugin-home__grid').append(card);
            });

            scroll.append(sec);
        });

        setupFocus(root);
    }

    function selectors() {
        if (!activeRoot) return $();
        return activeRoot.find('.selector:visible');
    }

    function focusAt(index) {
        var items = selectors();
        if (!items.length) return;

        if (index < 0) index = 0;
        if (index >= items.length) index = items.length - 1;

        focusedIndex = index;

        activeRoot.find('.selector').removeClass('focus hover');
        var item = items.eq(focusedIndex);
        item.addClass('focus');

        keepVisible(item);

        try {
            if (Lampa.Controller && typeof Lampa.Controller.collectionFocus == 'function') Lampa.Controller.collectionFocus(item);
        } catch (e) {}
    }

    function keepVisible(item) {
        if (!activeRoot || !item || !item.length) return;

        var scroll = activeRoot.find('.plugin-home__scroll');
        if (!scroll.length) return;

        var sc = scroll[0];
        var el = item[0];

        var itemTop = el.offsetTop;
        var itemBottom = itemTop + el.offsetHeight;
        var viewTop = sc.scrollTop;
        var viewBottom = viewTop + sc.clientHeight;

        if (itemTop < viewTop + 20) sc.scrollTop = Math.max(0, itemTop - 30);
        else if (itemBottom > viewBottom - 20) sc.scrollTop = itemBottom - sc.clientHeight + 30;
    }

    function columns() {
        if (!activeRoot) return 2;

        var firstGrid = activeRoot.find('.plugin-home__grid').first();
        if (!firstGrid.length) return 2;

        var c = firstGrid.css('grid-template-columns') || '';
        var count = c.split(' ').filter(Boolean).length;

        return Math.max(2, count) * 2; // each card has 2 buttons
    }

    function move(step) {
        focusAt(focusedIndex + step);
    }

    function triggerFocused() {
        var items = selectors();
        var item = items.eq(focusedIndex);
        if (item.length) item.trigger('hover:enter').trigger('click');
    }

    function bindKeys() {
        if (keyBound) return;
        keyBound = true;

        $(document).on('keydown.plugin_home_v210', function (e) {
            if (!activeRoot) return;

            var code = e.keyCode || e.which;
            var col = columns();

            if (code == 37) { e.preventDefault(); move(-1); }
            else if (code == 39) { e.preventDefault(); move(1); }
            else if (code == 38) { e.preventDefault(); move(-col); }
            else if (code == 40) { e.preventDefault(); move(col); }
            else if (code == 13) { e.preventDefault(); triggerFocused(); }
            else if (code == 8 || code == 27 || code == 461 || code == 10009) { e.preventDefault(); closeStore(); }
        });
    }

    function unbindKeys() {
        keyBound = false;
        $(document).off('keydown.plugin_home_v210');
    }

    function setupFocus(root) {
        if (Lampa.Controller) {
            try {
                Lampa.Controller.collectionSet(root);
            } catch (e) {}
        }

        setTimeout(function () {
            focusAt(0);
        }, 80);
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
                        '<div class="plugin-home__desc">' + STORE_DESC + '. Установка открывает родной экран Lampa.</div>' +
                    '</div>' +
                '</div>' +
                '<div class="plugin-home__actions">' +
                    '<div class="plugin-home__btn selector" data-action="refresh">Обновить</div>' +
                    '<div class="plugin-home__btn selector" data-action="system">Список Lampa</div>' +
                    '<div class="plugin-home__btn selector" data-action="close">Закрыть</div>' +
                '</div>' +
            '</div>' +
            '<div class="plugin-home__scroll"><div class="plugin-empty">Загрузка каталога...</div></div>' +
        '</div>');

        activeRoot = html;
        focusedIndex = 0;

        html.find('[data-action="close"]').on('hover:enter click', closeStore);
        html.find('[data-action="system"]').on('hover:enter click', function () { openNativeStore(STORE_URL); });
        html.find('[data-action="refresh"]').on('hover:enter click', function () {
            html.find('.plugin-home__scroll').html('<div class="plugin-empty">Обновляю каталог...</div>');
            loadCatalog(function (sections) { render(html, sections); });
        });

        $('body').append(html);
        bindKeys();

        if (Lampa.Controller) {
            Lampa.Controller.add(controllerName, {
                toggle: function () {},
                update: function () { setupFocus(html); },
                left: function () { move(-1); },
                right: function () { move(1); },
                up: function () { move(-columns()); },
                down: function () { move(columns()); },
                back: closeStore
            });

            Lampa.Controller.toggle(controllerName);
        }

        setupFocus(html);

        loadCatalog(function (sections) {
            render(html, sections);
        });
    }

    function closeStore() {
        $('.plugin-home').remove();
        activeRoot = null;
        unbindKeys();

        try {
            if (Lampa.Controller) Lampa.Controller.toggle('settings');
        } catch (e) {}
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
