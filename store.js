/*
 * name: Дом плагинов
 * author: shardice
 * version: 1.4.0
 * description: Красивый каталог плагинов для Lampa. Дизайн остаётся своим, установка открывает родное подтверждение Lampa.
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
        if ($('#home-plugins-store-style-clean-v4').length) return;

        $('body').append('<style id="home-plugins-store-style-clean-v4">' +
            '[data-component="' + COMPONENT + '"]{display:flex!important;align-items:center!important;gap:1.05em!important;min-height:5em!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__icon{width:2.8em!important;height:2.8em!important;min-width:2.8em!important;max-width:2.8em!important;margin:0 .9em 0 0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;flex:0 0 2.8em!important;border-radius:.6em!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__icon svg,[data-component="' + COMPONENT + '"] svg{width:2.72em!important;height:2.72em!important;max-width:2.72em!important;max-height:2.72em!important;display:block!important;}' +
            '[data-component="' + COMPONENT + '"] .settings-param__name,[data-component="' + COMPONENT + '"] .settings-param__descr{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}' +

            '.hps-screen{position:fixed;left:0;top:0;right:0;bottom:0;z-index:999999;background:radial-gradient(circle at 17% 9%,rgba(0,255,208,.20),transparent 30%),radial-gradient(circle at 88% 0%,rgba(88,107,255,.23),transparent 35%),linear-gradient(135deg,#0d1421,#171d2b 56%,#101522);color:#fff;padding:3.55em 4.2em;box-sizing:border-box;overflow:hidden;}' +
            '.hps-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.35em;}' +
            '.hps-brand{display:flex;align-items:center;gap:1.1em;min-width:0;}' +
            '.hps-logo{width:4.35em;height:4.35em;border-radius:1.15em;background:linear-gradient(135deg,#00ffd0,#2f80ff);display:flex;align-items:center;justify-content:center;font-size:2em;font-weight:900;box-shadow:0 1em 2.8em rgba(0,255,208,.18);flex:0 0 auto;}' +
            '.hps-title{font-size:2.35em;font-weight:900;line-height:1.05;white-space:nowrap;letter-spacing:0;}' +
            '.hps-subtitle{margin-top:.35em;color:rgba(255,255,255,.66);font-size:1.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:58vw;}' +
            '.hps-actions{display:flex;align-items:center;gap:.7em;}' +
            '.hps-topbtn{padding:.82em 1.05em;border-radius:.95em;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.13);font-weight:850;white-space:nowrap;}' +
            '.hps-scroll{height:calc(100% - 6.2em);overflow-y:auto;overflow-x:hidden;padding:0 .55em 8em 0;box-sizing:border-box;scroll-behavior:auto;}' +
            '.hps-section-title{font-size:1.15em;font-weight:900;margin:.2em 0 .9em;color:rgba(255,255,255,.92);}' +
            '.hps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1em;}' +
            '.hps-card{position:relative;min-height:22.3em;border-radius:1.45em;background:linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.13);box-shadow:0 1.2em 3.1em rgba(0,0,0,.27);overflow:hidden;padding:1.05em;box-sizing:border-box;}' +
            '.hps-cover{height:9.1em;border-radius:1.15em;background:linear-gradient(135deg,#00ffd0,#2f80ff);overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);}' +
            '.hps-cover img{display:block;width:100%;height:100%;object-fit:cover;}' +
            '.hps-name{margin-top:.9em;font-size:1.25em;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-desc{margin-top:.45em;height:3.65em;color:rgba(255,255,255,.70);font-size:.88em;line-height:1.35;overflow:hidden;}' +
            '.hps-meta{margin-top:.75em;color:rgba(255,255,255,.50);font-size:.78em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.hps-card-footer{position:absolute;left:1.05em;right:1.05em;bottom:1.05em;display:flex;align-items:center;gap:.65em;}' +
            '.hps-install{height:2.65em;padding:0 1em;border-radius:.8em;background:linear-gradient(135deg,#00ffd0,#2f80ff);color:#101522;font-weight:900;display:flex;align-items:center;justify-content:center;min-width:8.2em;}' +
            '.hps-hint{color:rgba(255,255,255,.62);font-size:.78em;font-weight:750;line-height:1.2;}' +
            '.hps-empty{padding:2em;border-radius:1.2em;background:rgba(255,255,255,.08);font-weight:850;color:rgba(255,255,255,.72);}' +
            '.hps-screen .selector.focus,.hps-screen .selector.hover{border-color:rgba(255,255,255,.42)!important;box-shadow:0 0 0 3px rgba(255,255,255,.25),0 1.2em 2.5em rgba(0,0,0,.34)!important;transform:translateY(-.07em) scale(1.015);}' +
            '@media(max-width:1280px){.hps-grid{grid-template-columns:repeat(2,1fr)}.hps-screen{padding:3.1em 3.3em}}' +
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
                var first = $('.settings-param.selector:visible').first();

                if (first.length && Lampa.Controller && typeof Lampa.Controller.collectionFocus === 'function') {
                    Lampa.Controller.collectionFocus(first);
                }
            } catch (e2) {}
        }, delay || 80);
    }

    function openNativeInstall(plugin) {
        /*
         * Родное подтверждение установки Lampa открывается в Lampa.Extensions.show.
         * Перед этим убираем свой высокий overlay, чтобы он не перекрыл родной экран.
         */
        if (!Lampa.Extensions || typeof Lampa.Extensions.show !== 'function') {
            if (Lampa.Noty) Lampa.Noty.show('Установка недоступна: Lampa.Extensions.show не найден');
            return;
        }

        closeScreen(false);

        setTimeout(function () {
            try {
                Lampa.Extensions.show({
                    store: plugin.store || STORE_URL,
                    with_installed: true
                });
            } catch (e) {
                console.log('Plugin install error:', e);
                if (Lampa.Noty) Lampa.Noty.show('Не удалось открыть установку');
                returnToSettings(80);
            }
        }, 80);
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
            scroll.append('<div class="hps-section-title">' + escapeHtml(section.title) + '</div>');

            var grid = $('<div class="hps-grid"></div>');

            section.items.forEach(function (plugin) {
                var card = $('<div class="hps-card selector">' +
                    '<div class="hps-cover">' + (plugin.cover ? '<img src="' + escapeHtml(plugin.cover) + '" alt="">' : '') + '</div>' +
                    '<div class="hps-name">' + escapeHtml(plugin.name) + '</div>' +
                    '<div class="hps-desc">' + escapeHtml(plugin.descr) + '</div>' +
                    '<div class="hps-meta">' + escapeHtml(plugin.author) + ' • v' + escapeHtml(plugin.version) + '</div>' +
                    '<div class="hps-card-footer">' +
                        '<div class="hps-install">Установить</div>' +
                        '<div class="hps-hint">OK — открыть установку Lampa</div>' +
                    '</div>' +
                '</div>');

                card.on('hover:enter click', function (e) {
                    stopEvent(e);
                    openNativeInstall(plugin);
                });

                card.on('mouseenter.home_plugins_store_clean', function () {
                    focusByElement(this);
                });

                grid.append(card);
            });

            scroll.append(grid);
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
    }

    function bindKeys() {
        if (keyBound) return;
        keyBound = true;

        $(document).on('keydown.home_plugins_store_clean_v4', function (e) {
            if (!active) return;

            var code = e.keyCode || e.which;

            if (code == 37) {
                stopEvent(e);
                moveFocus('left');
            } else if (code == 39) {
                stopEvent(e);
                moveFocus('right');
            } else if (code == 38) {
                stopEvent(e);
                moveFocus('up');
            } else if (code == 40) {
                stopEvent(e);
                moveFocus('down');
            } else if (code == 13) {
                stopEvent(e);
                var el = focusables().eq(focusIndex);
                if (el.length) el.trigger('hover:enter');
            } else if (code == 8 || code == 27 || code == 461 || code == 10009) {
                stopEvent(e);
                closeScreen(true);
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
                left: function () { moveFocus('left'); },
                right: function () { moveFocus('right'); },
                up: function () { moveFocus('up'); },
                down: function () { moveFocus('down'); },
                back: function () { closeScreen(true); }
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
                        '<div class="hps-subtitle">Бесплатные плагины без подписки. Установка подтверждается самой Lampa.</div>' +
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
