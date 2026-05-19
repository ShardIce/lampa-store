/*
 * name: Дом плагинов
 * author: shardice
 * version: 2.2.0
 * description: Автокаталог, cover-обложки и установка через родной экран Lampa
 */

(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json';
    var COVERS_BASE = 'https://shardice.github.io/lampa-store/covers/';
    var STORE_NAME = 'Дом плагинов';
    var STORE_DESC = 'Бесплатные плагины без подписки';

    var controllerName = 'plugin_home_store_220';
    var root = null;
    var focusedIndex = 0;
    var keyBound = false;

    Lampa.Lang.add({
        plugin_home_title: { ru: STORE_NAME, en: 'Plugin Home', uk: 'Дім плагінів' },
        plugin_home_descr: { ru: STORE_DESC, en: 'Free plugins without subscription', uk: 'Безкоштовні плагіни без підписки' }
    });

    function css() {
        if ($('#plugin-home-style-220').length) return;

        $('body').append('<style id="plugin-home-style-220">' +
            '[data-component="plugin_home_store"]{display:flex!important;align-items:center!important;gap:.85em!important;min-height:4.4em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon{width:1.45em!important;height:1.45em!important;min-width:1.45em!important;max-width:1.45em!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0 .72em 0 0!important;overflow:hidden!important;flex:0 0 1.45em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon svg,[data-component="plugin_home_store"] svg{width:1.34em!important;height:1.34em!important;max-width:1.34em!important;max-height:1.34em!important;display:block!important;}' +
            '[data-component="plugin_home_store"] .settings-param__name,[data-component="plugin_home_store"] .settings-param__descr{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}' +

            '.plugin-home{position:fixed;left:0;right:0;top:0;bottom:0;z-index:999999;background:radial-gradient(circle at 18% 12%,rgba(0,255,208,.20),transparent 28%),radial-gradient(circle at 85% 2%,rgba(124,92,255,.20),transparent 30%),linear-gradient(135deg,rgba(12,16,25,.985),rgba(20,24,34,.975));color:#fff;padding:3.25em 3.8em;overflow:hidden;}' +
            '.plugin-home__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1em;position:relative;z-index:2;}' +
            '.plugin-home__brand{display:flex;align-items:center;gap:1em;min-width:0;}' +
            '.plugin-home__logo{width:4em;height:4em;border-radius:1.1em;background:linear-gradient(135deg,#00ffd0,#7c5cff);display:flex;align-items:center;justify-content:center;font-size:1.75em;font-weight:900;box-shadow:0 1.2em 3em rgba(0,255,208,.16);flex:0 0 auto;}' +
            '.plugin-home__title{font-size:2.1em;font-weight:900;line-height:1.05;letter-spacing:-.035em;white-space:nowrap;}' +
            '.plugin-home__desc{margin-top:.3em;color:rgba(255,255,255,.66);font-size:.94em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:54vw;}' +
            '.plugin-home__actions{display:flex;align-items:center;gap:.6em;}' +
            '.plugin-home__topbtn{padding:.72em .95em;border-radius:.86em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);font-weight:800;white-space:nowrap;}' +
            '.plugin-home__scroll{height:calc(100% - 5.1em);overflow-y:auto;overflow-x:hidden;position:relative;z-index:2;padding-right:.55em;padding-bottom:8em;scroll-behavior:auto;}' +
            '.plugin-section{margin-bottom:1.1em;}' +
            '.plugin-section__title{font-size:1.08em;font-weight:900;margin:.15em 0 .72em;color:rgba(255,255,255,.92);}' +
            '.plugin-home__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.9em;}' +

            '.plugin-card{position:relative;min-height:20.4em;padding:.95em;border-radius:1.32em;background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.058));border:1px solid rgba(255,255,255,.13);box-shadow:0 1.2em 3.2em rgba(0,0,0,.28);overflow:hidden;}' +
            '.plugin-card:before{content:"";position:absolute;right:-2.5em;top:-2.5em;width:9em;height:9em;border-radius:50%;background:var(--accent);opacity:.12;filter:blur(.2em);}' +
            '.plugin-cover{position:relative;height:7.25em;border-radius:1.05em;background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.16));overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);}' +
            '.plugin-cover img{width:100%;height:100%;object-fit:cover;display:block;}' +
            '.plugin-cover__fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2em;font-weight:900;background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.16));}' +
            '.plugin-card__tag{position:absolute;right:.82em;top:.82em;padding:.36em .58em;border-radius:99em;background:rgba(255,255,255,.18);color:#fff;font-size:.7em;font-weight:800;z-index:3;}' +
            '.plugin-card__title{position:relative;margin-top:.75em;font-size:1.12em;font-weight:900;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__sub{position:relative;margin-top:.22em;color:var(--accent);font-size:.82em;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__text{position:relative;margin-top:.55em;color:rgba(255,255,255,.68);line-height:1.3;font-size:.79em;height:3.1em;overflow:hidden;}' +
            '.plugin-card__meta{position:relative;margin-top:.58em;color:rgba(255,255,255,.46);font-size:.7em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__actions{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:.5em;margin-top:.68em;}' +
            '.plugin-action{height:2.4em;border-radius:.72em;display:flex;align-items:center;justify-content:center;font-size:.78em;font-weight:900;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.11);}' +
            '.plugin-action--install{background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.24));color:#101018;}' +
            '.plugin-action--delete{background:rgba(255,90,90,.14);}' +
            '.plugin-empty{padding:2em;border-radius:1.4em;background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);font-weight:800;}' +
            '.plugin-home .selector.focus,.plugin-home .selector.hover{transform:translateY(-.06em);box-shadow:0 0 0 3px rgba(255,255,255,.24),0 1.2em 2.5em rgba(0,0,0,.35)!important;}' +
            '.plugin-home .plugin-action.focus,.plugin-home .plugin-action.hover{transform:none!important;box-shadow:0 0 0 2px rgba(255,255,255,.3)!important;}' +
            '@media(max-width:1250px){.plugin-home__grid{grid-template-columns:repeat(2,1fr)}.plugin-home{padding:3em 3em}}' +
        '</style>');
    }

    function iconSvg() {
        return '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">' +
            '<defs><linearGradient id="phg220" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00ffd0"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs>' +
            '<rect x="5" y="5" width="32" height="32" rx="9" fill="url(#phg220)"/>' +
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
            return COVERS_BASE + String(item.cover).replace(/^\/+/, '');
        }

        return COVERS_BASE + 'plugin-home.jpg';
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

    function parseCatalog(data) {
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
        fetch(STORE_URL + '?_=' + Date.now())
            .then(function (r) { return r.json(); })
            .then(function (data) { done(parseCatalog(data)); })
            .catch(function (e) {
                console.log('Plugin Home catalog error:', e);
                done([]);
            });
    }

    function openNativeStore(storeUrl) {
        var url = storeUrl || STORE_URL;

        closeStore(false);

        setTimeout(function () {
            try {
                if (Lampa.Extensions && typeof Lampa.Extensions.show == 'function') {
                    Lampa.Extensions.show({ store: url, with_installed: true });
                    return;
                }
            } catch (e) {
                console.log('Plugin Home native store error:', e);
            }

            if (Lampa.Noty) Lampa.Noty.show('Родной экран расширений недоступен');
        }, 250);
    }

    function render(sections) {
        var scroll = root.find('.plugin-home__scroll');
        scroll.empty();

        if (!sections.length) {
            scroll.append('<div class="plugin-empty">Каталог не загрузился. Проверь extensions.json и GitHub Pages.</div>');
            setupFocus();
            return;
        }

        sections.forEach(function (section) {
            var sec = $('<div class="plugin-section"><div class="plugin-section__title">' + section.title + '</div><div class="plugin-home__grid"></div></div>');

            section.plugins.forEach(function (plugin) {
                var card = $('<div class="plugin-card" style="--accent:' + plugin.accent + '">' +
                    '<div class="plugin-card__tag">' + plugin.tag + '</div>' +
                    '<div class="plugin-cover">' +
                        '<div class="plugin-cover__fallback">' + plugin.icon + '</div>' +
                        '<img src="' + plugin.cover + '" alt="">' +
                    '</div>' +
                    '<div class="plugin-card__title">' + plugin.title + '</div>' +
                    '<div class="plugin-card__sub">' + plugin.subtitle + '</div>' +
                    '<div class="plugin-card__text">' + plugin.description + '</div>' +
                    '<div class="plugin-card__meta">' + plugin.author + ' • v' + plugin.version + '</div>' +
                    '<div class="plugin-card__actions">' +
                        '<div class="plugin-action plugin-action--install selector">Установить</div>' +
                        '<div class="plugin-action plugin-action--delete selector">Удалить</div>' +
                    '</div>' +
                '</div>');

                card.find('img').on('error', function () {
                    $(this).remove();
                });

                card.find('.plugin-action--install').on('hover:enter click', function (e) {
                    e.stopPropagation();
                    openNativeStore(plugin.store || STORE_URL);
                });

                card.find('.plugin-action--delete').on('hover:enter click', function (e) {
                    e.stopPropagation();
                    openNativeStore(STORE_URL);
                });

                sec.find('.plugin-home__grid').append(card);
            });

            scroll.append(sec);
        });

        setupFocus();
    }

    function items() {
        if (!root) return $();
        return root.find('.selector:visible');
    }

    function setFocus(index) {
        var list = items();
        if (!list.length) return;

        if (index < 0) index = 0;
        if (index >= list.length) index = list.length - 1;

        focusedIndex = index;

        root.find('.selector').removeClass('focus hover');
        var el = list.eq(focusedIndex);
        el.addClass('focus');

        scrollToItem(el);

        try {
            if (Lampa.Controller && typeof Lampa.Controller.collectionFocus == 'function') {
                Lampa.Controller.collectionFocus(el);
            }
        } catch (e) {}
    }

    function scrollToItem(el) {
        var sc = root.find('.plugin-home__scroll')[0];
        if (!sc || !el || !el.length) return;

        var node = el[0];
        var top = node.offsetTop;
        var parent = node.offsetParent;

        while (parent && parent !== sc && parent !== document.body) {
            top += parent.offsetTop || 0;
            parent = parent.offsetParent;
        }

        var bottom = top + node.offsetHeight;
        var viewTop = sc.scrollTop;
        var viewBottom = viewTop + sc.clientHeight;

        if (top < viewTop + 30) sc.scrollTop = Math.max(0, top - 45);
        if (bottom > viewBottom - 30) sc.scrollTop = bottom - sc.clientHeight + 45;
    }

    function colStep() {
        var grid = root.find('.plugin-home__grid').first();
        var count = 3;

        if (grid.length) {
            var cssCols = grid.css('grid-template-columns') || '';
            count = Math.max(2, cssCols.split(' ').filter(Boolean).length);
        }

        return count * 2;
    }

    function move(delta) {
        setFocus(focusedIndex + delta);
    }

    function press() {
        var el = items().eq(focusedIndex);
        if (el.length) el.trigger('hover:enter').trigger('click');
    }

    function bindKeys() {
        if (keyBound) return;
        keyBound = true;

        $(document).on('keydown.plugin_home_220', function (e) {
            if (!root) return;

            var code = e.keyCode || e.which;

            if (code == 37) { e.preventDefault(); move(-1); }
            else if (code == 39) { e.preventDefault(); move(1); }
            else if (code == 38) { e.preventDefault(); move(-colStep()); }
            else if (code == 40) { e.preventDefault(); move(colStep()); }
            else if (code == 13) { e.preventDefault(); press(); }
            else if (code == 8 || code == 27 || code == 461 || code == 10009) { e.preventDefault(); closeStore(true); }
        });
    }

    function unbindKeys() {
        keyBound = false;
        $(document).off('keydown.plugin_home_220');
    }

    function setupFocus() {
        try {
            if (Lampa.Controller) Lampa.Controller.collectionSet(root);
        } catch (e) {}

        setTimeout(function () { setFocus(Math.min(focusedIndex, Math.max(0, items().length - 1))); }, 80);
    }

    function openStore() {
        css();

        $('.plugin-home').remove();

        root = $('<div class="plugin-home">' +
            '<div class="plugin-home__head">' +
                '<div class="plugin-home__brand">' +
                    '<div class="plugin-home__logo">⌂</div>' +
                    '<div>' +
                        '<div class="plugin-home__title">' + STORE_NAME + '</div>' +
                        '<div class="plugin-home__desc">' + STORE_DESC + '. Установка открывает родной экран Lampa.</div>' +
                    '</div>' +
                '</div>' +
                '<div class="plugin-home__actions">' +
                    '<div class="plugin-home__topbtn selector" data-action="refresh">Обновить</div>' +
                    '<div class="plugin-home__topbtn selector" data-action="system">Список Lampa</div>' +
                    '<div class="plugin-home__topbtn selector" data-action="close">Закрыть</div>' +
                '</div>' +
            '</div>' +
            '<div class="plugin-home__scroll"><div class="plugin-empty">Загрузка каталога...</div></div>' +
        '</div>');

        focusedIndex = 0;

        root.find('[data-action="close"]').on('hover:enter click', function () { closeStore(true); });
        root.find('[data-action="system"]').on('hover:enter click', function () { openNativeStore(STORE_URL); });
        root.find('[data-action="refresh"]').on('hover:enter click', function () {
            root.find('.plugin-home__scroll').html('<div class="plugin-empty">Обновляю каталог...</div>');
            loadCatalog(render);
        });

        $('body').append(root);

        bindKeys();

        if (Lampa.Controller) {
            Lampa.Controller.add(controllerName, {
                toggle: function () {},
                update: setupFocus,
                left: function () { move(-1); },
                right: function () { move(1); },
                up: function () { move(-colStep()); },
                down: function () { move(colStep()); },
                back: function () { closeStore(true); }
            });

            Lampa.Controller.toggle(controllerName);
        }

        setupFocus();
        loadCatalog(render);
    }

    function closeStore(returnToSettings) {
        $('.plugin-home').remove();
        root = null;
        unbindKeys();

        if (returnToSettings) {
            try {
                if (Lampa.Controller) Lampa.Controller.toggle('settings');
            } catch (e) {}
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
                '<div class="settings-param__icon">' + iconSvg() + '</div>' +
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
