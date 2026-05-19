/*
 * name: Shardice Store
 * author: shardice
 * version: 1.3.0
 * description: Красивый каталог пользовательских плагинов для Lampa
 */

(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json?v=130';

    var PLUGINS = [
        {
            title: 'Reload Lampa Button',
            subtitle: 'Перезагрузка в верхнем меню',
            description: 'Добавляет отдельную кнопку перезагрузки Lampa в верхнюю панель.',
            author: '@shardice',
            version: '1.0.0',
            tag: 'System',
            accent: '#00ffd0',
            icon: '↻',
            url: 'https://shardice.github.io/lampa-store/plugins/reload-button.js?v=100'
        },
        {
            title: 'Статусы фильмов и сериалов',
            subtitle: 'Личная медиатека без премиума',
            description: 'Статусы: смотрю, буду смотреть, просмотрено, отложено и брошено.',
            author: '@shardice',
            version: '1.0.5',
            tag: 'Library',
            accent: '#7c5cff',
            icon: '✓',
            url: 'https://shardice.github.io/lampa-store/plugins/movie-statuses.js?v=105'
        },
        {
            title: 'Очистка интерфейса',
            subtitle: 'Скоро',
            description: 'Будущий плагин для скрытия лишних элементов и упрощения интерфейса Lampa.',
            author: '@shardice',
            version: '0.1.0',
            tag: 'UI',
            accent: '#ffcc66',
            icon: '✦',
            url: 'https://shardice.github.io/lampa-store/plugins/coming-soon.js?v=130'
        }
    ];

    Lampa.Lang.add({
        shardice_store_title: {
            ru: 'Shardice Store',
            en: 'Shardice Store',
            uk: 'Shardice Store'
        },
        shardice_store_descr: {
            ru: 'Красивый каталог плагинов и улучшений',
            en: 'Beautiful plugin catalog',
            uk: 'Красивий каталог плагінів'
        }
    });

    function css() {
        if ($('#shardice-store-style').length) return;

        $('body').append('<style id="shardice-store-style">' +
            '[data-component="shardice_store"]{min-height:auto!important;}' +
            '[data-component="shardice_store"] .settings-param__icon{width:2.75em!important;height:2.75em!important;min-width:2.75em!important;max-width:2.75em!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;margin-right:1em!important;flex:0 0 2.75em!important;}' +
            '[data-component="shardice_store"] .settings-param__icon svg{width:2.35em!important;height:2.35em!important;min-width:2.35em!important;max-width:2.35em!important;display:block!important;}' +
            '[data-component="shardice_store"] .settings-param__body{min-width:0!important;}' +
            '.shardice-store{position:fixed;left:0;right:0;top:0;bottom:0;z-index:999999;background:radial-gradient(circle at 20% 10%,rgba(0,255,208,.22),transparent 28%),radial-gradient(circle at 80% 0%,rgba(124,92,255,.22),transparent 30%),linear-gradient(135deg,rgba(12,16,25,.98),rgba(20,24,34,.96));color:#fff;padding:4.5em 5em;overflow:hidden;}' +
            '.shardice-store:before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,#00ffd0,#7c5cff,transparent);opacity:.9;}' +
            '.shardice-store__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:2.2em;position:relative;z-index:2;}' +
            '.shardice-store__brand{display:flex;align-items:center;gap:1.2em;}' +
            '.shardice-store__logo{width:4.8em;height:4.8em;border-radius:1.3em;background:linear-gradient(135deg,#00ffd0,#7c5cff);display:flex;align-items:center;justify-content:center;font-size:2.3em;font-weight:800;box-shadow:0 1.2em 3em rgba(0,255,208,.18);}' +
            '.shardice-store__title{font-size:2.65em;font-weight:800;line-height:1.05;letter-spacing:-.03em;}' +
            '.shardice-store__desc{margin-top:.35em;color:rgba(255,255,255,.62);font-size:1.08em;}' +
            '.shardice-store__close{padding:.85em 1.25em;border-radius:1.1em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);font-weight:700;}' +
            '.shardice-store__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2em;position:relative;z-index:2;}' +
            '.shardice-card{position:relative;min-height:15.7em;padding:1.45em;border-radius:1.65em;background:linear-gradient(180deg,rgba(255,255,255,.115),rgba(255,255,255,.062));border:1px solid rgba(255,255,255,.13);box-shadow:0 1.2em 3.2em rgba(0,0,0,.28);overflow:hidden;}' +
            '.shardice-card:before{content:"";position:absolute;right:-2.5em;top:-2.5em;width:9em;height:9em;border-radius:50%;background:var(--accent);opacity:.18;filter:blur(.2em);}' +
            '.shardice-card__top{display:flex;align-items:flex-start;justify-content:space-between;gap:1em;}' +
            '.shardice-card__icon{width:3.6em;height:3.6em;border-radius:1.05em;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:1.7em;font-weight:900;color:#101018;box-shadow:0 .8em 2em rgba(0,0,0,.22);}' +
            '.shardice-card__tag{padding:.45em .7em;border-radius:99em;background:rgba(255,255,255,.09);color:rgba(255,255,255,.72);font-size:.82em;}' +
            '.shardice-card__title{margin-top:1em;font-size:1.42em;font-weight:800;line-height:1.15;}' +
            '.shardice-card__sub{margin-top:.32em;color:var(--accent);font-size:.98em;font-weight:700;}' +
            '.shardice-card__text{margin-top:.85em;color:rgba(255,255,255,.66);line-height:1.35;font-size:.96em;min-height:3.8em;}' +
            '.shardice-card__meta{margin-top:1em;color:rgba(255,255,255,.46);font-size:.82em;}' +
            '.shardice-card__actions{display:flex;gap:.7em;margin-top:1.15em;}' +
            '.shardice-btn{padding:.82em 1em;border-radius:1em;font-weight:800;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.11);}' +
            '.shardice-btn--primary{background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.22));color:#101018;}' +
            '.shardice-store .selector.focus,.shardice-store .selector.hover{transform:translateY(-.08em);box-shadow:0 0 0 3px rgba(255,255,255,.17),0 1.4em 3em rgba(0,0,0,.35);}' +
            '@media(max-width:1200px){.shardice-store__grid{grid-template-columns:repeat(2,1fr)}.shardice-store{padding:3.5em 3.5em}}' +
            '</style>');
    }

    function storeIcon() {
        return '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs><linearGradient id="ssg2" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00ffd0"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs>' +
            '<rect x="4" y="4" width="34" height="34" rx="10" fill="url(#ssg2)"/>' +
            '<path d="M13 22l5 5 12-13" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<circle cx="31" cy="11" r="3.2" fill="#fff"/>' +
        '</svg>';
    }

    function installPlugin(plugin) {
        var done = false;

        try {
            if (Lampa.Extensions) {
                if (typeof Lampa.Extensions.install == 'function') {
                    Lampa.Extensions.install(plugin.url);
                    done = true;
                } else if (typeof Lampa.Extensions.add == 'function') {
                    Lampa.Extensions.add(plugin.url);
                    done = true;
                } else if (typeof Lampa.Extensions.addPlugin == 'function') {
                    Lampa.Extensions.addPlugin(plugin.url);
                    done = true;
                }
            }
        } catch (e) {
            done = false;
            console.log('Shardice Store install error:', e);
        }

        if (done) {
            if (Lampa.Noty) Lampa.Noty.show('Установка: ' + plugin.title);
        } else {
            if (Lampa.Noty) Lampa.Noty.show('Открою системную установку Lampa');
            Lampa.Extensions.show({
                store: STORE_URL,
                with_installed: true
            });
        }
    }

    function openNativeStore() {
        Lampa.Extensions.show({
            store: STORE_URL,
            with_installed: true
        });
    }

    function openStore() {
        css();

        $('.shardice-store').remove();

        var html = $('<div class="shardice-store">' +
            '<div class="shardice-store__head">' +
                '<div class="shardice-store__brand">' +
                    '<div class="shardice-store__logo">S</div>' +
                    '<div>' +
                        '<div class="shardice-store__title">Shardice Store</div>' +
                        '<div class="shardice-store__desc">Чистый каталог плагинов для Lampa. Быстро, красиво, без мусора.</div>' +
                    '</div>' +
                '</div>' +
                '<div class="shardice-store__close selector" data-action="close">Закрыть</div>' +
            '</div>' +
            '<div class="shardice-store__grid"></div>' +
        '</div>');

        PLUGINS.forEach(function (plugin) {
            var card = $('<div class="shardice-card selector" style="--accent:' + plugin.accent + '">' +
                '<div class="shardice-card__top">' +
                    '<div class="shardice-card__icon">' + plugin.icon + '</div>' +
                    '<div class="shardice-card__tag">' + plugin.tag + '</div>' +
                '</div>' +
                '<div class="shardice-card__title">' + plugin.title + '</div>' +
                '<div class="shardice-card__sub">' + plugin.subtitle + '</div>' +
                '<div class="shardice-card__text">' + plugin.description + '</div>' +
                '<div class="shardice-card__meta">' + plugin.author + ' • v' + plugin.version + '</div>' +
                '<div class="shardice-card__actions">' +
                    '<div class="shardice-btn shardice-btn--primary selector" data-action="install">Установить</div>' +
                    '<div class="shardice-btn selector" data-action="native">Системный список</div>' +
                '</div>' +
            '</div>');

            card.find('[data-action="install"]').on('hover:enter', function () {
                installPlugin(plugin);
            });

            card.find('[data-action="native"]').on('hover:enter', function () {
                openNativeStore();
            });

            html.find('.shardice-store__grid').append(card);
        });

        html.find('[data-action="close"]').on('hover:enter', closeStore);

        $('body').append(html);

        if (Lampa.Controller) {
            Lampa.Controller.add('shardice_store', {
                toggle: function () {},
                update: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(html.find('.selector').eq(1));
                },
                left: function () { Lampa.Controller.collectionFocus(false, html); },
                right: function () { Lampa.Controller.collectionFocus(false, html); },
                up: function () { Lampa.Controller.collectionFocus(false, html); },
                down: function () { Lampa.Controller.collectionFocus(false, html); },
                back: closeStore
            });

            Lampa.Controller.toggle('shardice_store');
        }
    }

    function closeStore() {
        $('.shardice-store').remove();

        if (Lampa.Controller) {
            Lampa.Controller.toggle('settings');
        }
    }

    function addStoreButton() {
        css();

        if (!Lampa.Settings || !Lampa.Settings.main) return;

        var settings = Lampa.Settings.main();
        var render = settings.render();

        if (render.find('[data-component="shardice_store"]').length) return;

        var field = $(
            '<div class="settings-param selector" data-component="shardice_store">' +
                '<div class="settings-param__icon">' + storeIcon() + '</div>' +
                '<div class="settings-param__body">' +
                    '<div class="settings-param__name">' + Lampa.Lang.translate('shardice_store_title') + '</div>' +
                    '<div class="settings-param__descr">' + Lampa.Lang.translate('shardice_store_descr') + '</div>' +
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
            e.body.find('[data-component="shardice_store"]').off('hover:enter').on('hover:enter', openStore);
        }
    });

    if (window.appready) addStoreButton();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addStoreButton();
        });
    }
})();
