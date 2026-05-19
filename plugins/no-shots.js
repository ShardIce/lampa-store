/*
 * name: No Shots
 * author: shardice
 * version: 1.0.0
 * description: Убирает Shots из меню, карточек, рядов контента и панели плеера Lampa.
 */

(function () {
    'use strict';

    function startPlugin() {
        function isArray(value) {
            return (Lampa.Arrays && Lampa.Arrays.isArray) ? Lampa.Arrays.isArray(value) : Array.isArray(value);
        }

        function log() {
            try {
                var args = Array.prototype.slice.call(arguments);
                args.unshift('No Shots');
                console.log.apply(console, args);
            } catch (e) {}
        }

        function storageDisableShots() {
            try {
                Lampa.Storage.set('content_rows_shots_main', 'false');
            } catch (e) {}
        }

        function hasShotsRedCircle(el) {
            var item = $(el);
            var red = item.find('circle[fill="#FF0707"], circle[fill="#ff0707"], circle[fill="red"]');

            return red.length > 0 ||
                (item.find('svg circle').length === 2 && item.find('svg circle').eq(1).attr('fill') === '#FF0707');
        }

        function removeShotsPlayerButton() {
            var selector = '[data-controller="player_panel"]';

            function removeIn(root) {
                root.find(selector).each(function () {
                    if (hasShotsRedCircle(this)) {
                        log('Removed Shots record button');
                        $(this).remove();
                    }
                });

                root.find('.shots-player-segments, .shots-player-recorder, [class*="shots-player"]').remove();
            }

            try {
                if (Lampa.PlayerPanel && Lampa.PlayerPanel.render) removeIn(Lampa.PlayerPanel.render());
            } catch (e) {}

            try {
                $(selector).each(function () {
                    if (hasShotsRedCircle(this)) $(this).remove();
                });
            } catch (e2) {}
        }

        function removeShotsMenuItems() {
            try {
                if (!Lampa.Menu || !Lampa.Menu.render) return;

                var menu = Lampa.Menu.render();
                if (!menu || !menu.length) return;

                menu.find('.menu__item').each(function () {
                    var item = $(this);
                    var text = (item.find('.menu__text').text() || '').toLowerCase();
                    var hasIcon = item.find('use[xlink\\:href="#sprite-shots"]').length > 0;

                    if (text.indexOf('shots') >= 0 || hasIcon) {
                        log('Removed Shots menu button');
                        item.remove();
                    }
                });
            } catch (e) {}
        }

        function removeShotsDom() {
            try {
                $('[class*="shots-"], [id*="shots-"], [data-shots], .shots-view-button, .shots-player-segments, .shots-player-recorder, .shots-modal, .shots-lenta').remove();
                removeShotsPlayerButton();
                removeShotsMenuItems();
            } catch (e) {}
        }

        function patchContentRows() {
            if (!Lampa.ContentRows || window.no_shots_content_rows_patched) return;
            window.no_shots_content_rows_patched = true;

            if (typeof Lampa.ContentRows.add === 'function') {
                var originalAdd = Lampa.ContentRows.add;

                Lampa.ContentRows.add = function (row) {
                    if (row) {
                        if (row.name === 'shots_main') {
                            log('Blocked Shots content row:', row.name);
                            return;
                        }

                        if (row.screen && isArray(row.screen) && row.screen.indexOf('bookmarks') >= 0 && typeof row.call === 'function') {
                            var callStr = row.call.toString();
                            var isShotsBookmarks = callStr.indexOf('shots_title_favorite') >= 0 ||
                                callStr.indexOf('shots_title_created') >= 0 ||
                                (callStr.indexOf('Favorite.get') >= 0 && callStr.indexOf('Created.get') >= 0 && callStr.indexOf('shots') >= 0);

                            if (isShotsBookmarks) {
                                log('Blocked Shots bookmarks content row');
                                return;
                            }
                        }
                    }

                    return originalAdd.call(this, row);
                };
            }

            if (typeof Lampa.ContentRows.call === 'function') {
                var originalCall = Lampa.ContentRows.call;

                Lampa.ContentRows.call = function (screen, params, calls) {
                    storageDisableShots();

                    var result = originalCall.call(this, screen, params, calls);

                    if (isArray(calls)) {
                        for (var i = calls.length - 1; i >= 0; i--) {
                            var callItem = calls[i];

                            if (callItem && typeof callItem === 'object') {
                                var isShots = callItem.title === 'Shots' ||
                                    (callItem.icon_svg && callItem.icon_svg.indexOf('sprite-shots') >= 0) ||
                                    (callItem.results && isArray(callItem.results) && callItem.results.length && callItem.results[0].type === 'shot');

                                if (isShots) {
                                    log('Filtered out Shots content row from calls');
                                    calls.splice(i, 1);
                                }
                            }
                        }
                    }

                    return result;
                };
            }
        }

        function patchSelect() {
            if (!Lampa.Select || typeof Lampa.Select.show !== 'function' || window.no_shots_select_patched) return;
            window.no_shots_select_patched = true;

            var originalSelectShow = Lampa.Select.show;

            Lampa.Select.show = function (options) {
                if (options && isArray(options.items)) {
                    options.items = options.items.filter(function (item) {
                        if (!item) return true;

                        if (item.btn) {
                            var btn = $(item.btn);
                            var isShotsButton = btn.hasClass('shots-view-button') ||
                                (btn.hasClass('view--online') && btn.find('use[xlink\\:href="#sprite-shots"]').length > 0) ||
                                btn.find('.shots-view-button__title').length > 0 ||
                                (item.title && item.title.toLowerCase().indexOf('shots') >= 0);

                            if (isShotsButton) {
                                log('Filtered out Shots item from Watch menu');
                                return false;
                            }
                        }

                        if (item.title && item.title.toLowerCase().indexOf('shots') >= 0) return false;
                        if (item.icon && item.icon.indexOf('sprite-shots') >= 0) return false;

                        return true;
                    });
                }

                return originalSelectShow.call(this, options);
            };
        }

        function patchPlayerPanel() {
            if (!Lampa.PlayerPanel || typeof Lampa.PlayerPanel.render !== 'function' || window.no_shots_player_panel_patched) return;
            window.no_shots_player_panel_patched = true;

            var originalRender = Lampa.PlayerPanel.render;

            Lampa.PlayerPanel.render = function () {
                var result = originalRender.call(this);
                setTimeout(removeShotsPlayerButton, 10);
                return result;
            };
        }

        function removeShotsFullViewButton() {
            try {
                var active = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : false;
                if (!active || !active.activity || !active.activity.render) return;

                var render = active.activity.render();
                render.find('.shots-view-button, [class*="shots-view"], .view--online.shots-view-button').remove();
                render.find('.buttons--container .shots-view-button, .buttons--container .view--online.shots-view-button').remove();
            } catch (e) {}
        }

        function removeShotsComponents() {
            if (!Lampa.Component || !Lampa.Component.remove) return;

            ['shots_list', 'shots_card', 'shots_channel'].forEach(function (name) {
                try {
                    Lampa.Component.remove(name);
                    log('Removed component:', name);
                } catch (e) {}
            });
        }

        function addCss() {
            if ($('#no_shots_styles').length) return;

            $('body').append(
                '<style id="no_shots_styles">' +
                    '.content-rows [data-type="favorite"][data-title*="Shots"],' +
                    '.content-rows [data-type="created"][data-title*="Shots"],' +
                    '.line[data-name="shots_main"],' +
                    '.line[data-type*="shots"],' +
                    '.shots-view-button,' +
                    '.full-start__button.shots-view-button,' +
                    '[class*="shots-view"],' +
                    '.shots-player-segments,' +
                    '.shots-player-recorder,' +
                    '.shots-player--recording,' +
                    '[class*="shots-player"],' +
                    '.shots-modal,' +
                    '.shots-lenta,' +
                    '[class*="shots-modal"],' +
                    '[class*="shots-lenta"],' +
                    '[class*="shots-"],' +
                    '[id*="shots-"],' +
                    '[data-shots]{display:none!important;visibility:hidden!important;}' +
                '</style>'
            );
        }

        function bindListeners() {
            if (window.no_shots_listeners_bound) return;
            window.no_shots_listeners_bound = true;

            try {
                Lampa.Listener.follow('menu', function (e) {
                    if (e.type === 'end' || e.type === 'start') setTimeout(removeShotsMenuItems, 100);
                });

                Lampa.Listener.follow('full', function (e) {
                    if (e.type === 'complite') setTimeout(removeShotsFullViewButton, 50);
                });

                Lampa.Listener.follow('player', function (e) {
                    if (e.type === 'render' || e.type === 'ready' || e.type === 'open' || e.type === 'start') {
                        setTimeout(removeShotsPlayerButton, 50);
                    }
                });

                if (Lampa.PlayerPanel && Lampa.PlayerPanel.listener) {
                    Lampa.PlayerPanel.listener.follow('render', function () {
                        setTimeout(removeShotsPlayerButton, 10);
                    });
                }
            } catch (e2) {}
        }

        function startIntervals() {
            if (window.no_shots_intervals_started) return;
            window.no_shots_intervals_started = true;

            setInterval(removeShotsMenuItems, 1000);
            setInterval(removeShotsFullViewButton, 500);
            setInterval(removeShotsDom, 250);
        }

        function init() {
            if (window.no_shots_plugin_started) return;
            window.no_shots_plugin_started = true;

            storageDisableShots();
            patchContentRows();
            patchSelect();
            patchPlayerPanel();
            removeShotsComponents();
            addCss();
            bindListeners();
            startIntervals();
            removeShotsDom();

            log('Initialized');
        }

        if (window.appready) {
            init();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') init();
            });
        }
    }

    startPlugin();
})();
