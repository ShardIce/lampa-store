/*
 * name: Дом плагинов
 * author: shardice
 * version: 1.4.0
 * description: Бесплатные плагины для Lampa без подписки
 */

(function () {
    'use strict';

    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json?v=140';

    var STORE_NAME = 'Дом плагинов';
    var STORE_DESC = 'Бесплатные плагины без подписки';

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
            title: 'Статусы фильмов',
            subtitle: 'Медиатека без премиума',
            description: 'Статусы: смотрю, буду смотреть, просмотрено, отложено и брошено.',
            author: '@shardice',
            version: '1.0.6',
            tag: 'Library',
            accent: '#7c5cff',
            icon: '✓',
            url: 'https://shardice.github.io/lampa-store/plugins/movie-statuses.js?v=106'
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
            url: 'https://shardice.github.io/lampa-store/plugins/coming-soon.js?v=140'
        }
    ];

    Lampa.Lang.add({
        plugin_home_title: {
            ru: STORE_NAME,
            en: 'Plugin Home',
            uk: 'Дім плагінів'
        },
        plugin_home_descr: {
            ru: STORE_DESC,
            en: 'Free plugins without subscription',
            uk: 'Безкоштовні плагіни без підписки'
        }
    });

    function css() {
        if ($('#plugin-home-style').length) return;

        $('body').append('<style id="plugin-home-style">' +
            '[data-component="plugin_home_store"]{display:flex!important;align-items:center!important;gap:1em!important;min-height:4.7em!important;padding-top:.65em!important;padding-bottom:.65em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon{width:2.35em!important;height:2.35em!important;min-width:2.35em!important;max-width:2.35em!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;margin:0!important;flex:0 0 2.35em!important;}' +
            '[data-component="plugin_home_store"] .settings-param__icon svg{width:2.1em!important;height:2.1em!important;display:block!important;}' +
            '[data-component="plugin_home_store"] .settings-param__body{display:block!important;min-width:0!important;overflow:hidden!important;}' +
            '[data-component="plugin_home_store"] .settings-param__name{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.15!important;}' +
            '[data-component="plugin_home_store"] .settings-param__descr{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.2!important;}' +

            '.plugin-home{position:fixed;left:0;right:0;top:0;bottom:0;z-index:999999;background:radial-gradient(circle at 18% 12%,rgba(0,255,208,.20),transparent 28%),radial-gradient(circle at 85% 2%,rgba(124,92,255,.20),transparent 30%),linear-gradient(135deg,rgba(12,16,25,.98),rgba(20,24,34,.97));color:#fff;padding:4.4em 5em;overflow:hidden;}' +
            '.plugin-home:before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,#00ffd0,#7c5cff,transparent);opacity:.9;}' +
            '.plugin-home__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:2.2em;position:relative;z-index:2;}' +
            '.plugin-home__brand{display:flex;align-items:center;gap:1.15em;}' +
            '.plugin-home__logo{width:4.7em;height:4.7em;border-radius:1.25em;background:linear-gradient(135deg,#00ffd0,#7c5cff);display:flex;align-items:center;justify-content:center;font-size:2.15em;font-weight:900;box-shadow:0 1.2em 3em rgba(0,255,208,.16);}' +
            '.plugin-home__title{font-size:2.55em;font-weight:900;line-height:1.05;letter-spacing:-.035em;white-space:nowrap;}' +
            '.plugin-home__desc{margin-top:.35em;color:rgba(255,255,255,.62);font-size:1.08em;white-space:nowrap;}' +
            '.plugin-home__close{padding:.85em 1.25em;border-radius:1.1em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);font-weight:800;}' +
            '.plugin-home__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2em;position:relative;z-index:2;}' +
            '.plugin-card{position:relative;min-height:15.5em;padding:1.45em;border-radius:1.65em;background:linear-gradient(180deg,rgba(255,255,255,.115),rgba(255,255,255,.062));border:1px solid rgba(255,255,255,.13);box-shadow:0 1.2em 3.2em rgba(0,0,0,.28);overflow:hidden;}' +
            '.plugin-card:before{content:"";position:absolute;right:-2.5em;top:-2.5em;width:9em;height:9em;border-radius:50%;background:var(--accent);opacity:.18;filter:blur(.2em);}' +
            '.plugin-card__top{display:flex;align-items:flex-start;justify-content:space-between;gap:1em;}' +
            '.plugin-card__icon{width:3.5em;height:3.5em;border-radius:1.05em;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:1.65em;font-weight:900;color:#101018;box-shadow:0 .8em 2em rgba(0,0,0,.22);}' +
            '.plugin-card__tag{padding:.45em .7em;border-radius:99em;background:rgba(255,255,255,.09);color:rgba(255,255,255,.72);font-size:.82em;}' +
            '.plugin-card__title{margin-top:1em;font-size:1.4em;font-weight:900;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__sub{margin-top:.32em;color:var(--accent);font-size:.98em;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.plugin-card__text{margin-top:.85em;color:rgba(255,255,255,.66);line-height:1.35;font-size:.96em;min-height:3.8em;}' +
            '.plugin-card__meta{margin-top:1em;color:rgba(255,255,255,.46);font-size:.82em;}' +
            '.plugin-card__actions{display:flex;gap:.7em;margin-top:1.15em;}' +
            '.plugin-btn{padding:.82em 1em;border-radius:1em;font-weight:800;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.11);white-space:nowrap;}' +
            '.plugin-btn--primary{background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.22));color:#101018;}' +
            '.plugin-home .selector.focus,.plugin-home .selector.hover{transform:translateY(-.08em);box-shadow:0 0 0 3px rgba(255,255,255,.17),0 1.4em 3em rgba(0,0,0,.35);}' +
            '@media(max-width:1200px){.plugin-home__grid{grid-template-columns:repeat(2,1fr)}.plugin-home{padding:3.5em 3.5em}}' +
        '</style>');
    }

    function storeIcon() {
        return '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs><linearGradient id="phg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00ffd0"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs>' +
            '<rect x="5" y="5" width="32" height="32" rx="9" fill="url(#phg)"/>' +
            '<path d="M13.5 22.5h15M13.5 17h15M13.5 28h10" stroke="#fff" stroke-width="2.7" stroke-linecap="round"/>' +
            '<circle cx="30" cy="28" r="3" fill="#fff"/>' +
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
            console.log('Plugin Home install error:', e);
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

        $('.plugin-home').remove();

        var html = $('<div class="plugin-home">' +
            '<div class="plugin-home__head">' +
                '<div class="plugin-home__brand">' +
                    '<div class="plugin-home__logo">⌂</div>' +
                    '<div>' +
                        '<div class="plugin-home__title">' + STORE_NAME + '</div>' +
                        '<div class="plugin-home__desc">' + STORE_DESC + '. Быстро, красиво, без мусора.</div>' +
                    '</div>' +
                '</div>' +
                '<div class="plugin-home__close selector" data-action="close">Закрыть</div>' +
            '</div>' +
            '<div class="plugin-home__grid"></div>' +
        '</div>');

        PLUGINS.forEach(function (plugin) {
            var card = $('<div class="plugin-card selector" style="--accent:' + plugin.accent + '">' +
                '<div class="plugin-card__top">' +
                    '<div class="plugin-card__icon">' + plugin.icon + '</div>' +
                    '<div class="plugin-card__tag">' + plugin.tag + '</div>' +
                '</div>' +
                '<div class="plugin-card__title">' + plugin.title + '</div>' +
                '<div class="plugin-card__sub">' + plugin.subtitle + '</div>' +
                '<div class="plugin-card__text">' + plugin.description + '</div>' +
                '<div class="plugin-card__meta">' + plugin.author + ' • v' + plugin.version + '</div>' +
                '<div class="plugin-card__actions">' +
                    '<div class="plugin-btn plugin-btn--primary selector" data-action="install">Установить</div>' +
                    '<div class="plugin-btn selector" data-action="native">Список</div>' +
                '</div>' +
            '</div>');

            card.find('[data-action="install"]').on('hover:enter', function () {
                installPlugin(plugin);
            });

            card.find('[data-action="native"]').on('hover:enter', function () {
                openNativeStore();
            });

            html.find('.plugin-home__grid').append(card);
        });

        html.find('[data-action="close"]').on('hover:enter', closeStore);

        $('body').append(html);

        if (Lampa.Controller) {
            Lampa.Controller.add('plugin_home_store', {
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

            Lampa.Controller.toggle('plugin_home_store');
        }
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
