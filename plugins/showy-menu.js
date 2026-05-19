/*
 * name: Showy Online Menu
 * author: shardice
 * version: 1.1.0
 * description: Загружает Showy Online и добавляет пункт Showy в левое меню Lampa.
 */

(function () {
    'use strict';

    var COMPONENT = 'showy_menu';
    var SHOWY_URL = 'http://showwwy.com/m.js';
    var loaded = false;
    var menuAdded = false;
    var attemptsLeft = 8;

    function safe(fn) {
        try {
            return fn();
        } catch (e) {
            return null;
        }
    }

    function icon() {
        return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="3" y="4" width="18" height="14" rx="3" stroke="currentColor" stroke-width="2"/>' +
            '<path d="M10 8.8L15.2 11L10 13.2V8.8Z" fill="currentColor"/>' +
            '<path d="M8 21H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>';
    }

    function notify(message) {
        safe(function () {
            if (Lampa.Noty && typeof Lampa.Noty.show === 'function') {
                Lampa.Noty.show(message);
            }
        });
    }

    function ensureShowy(callback) {
        if (window.lampac_plugin || window.showy_plugin) {
            loaded = true;
            callback();
            return;
        }

        if (loaded) {
            callback();
            return;
        }

        loaded = true;

        if (Lampa.Utils && typeof Lampa.Utils.putScript === 'function') {
            Lampa.Utils.putScript([SHOWY_URL], function () {}, false, function () {
                callback();
            }, true);
        } else {
            notify('Не удалось загрузить Showy: Lampa.Utils.putScript не найден');
        }
    }

    function makeMovie(query) {
        var title = (query || '').trim();
        var id = safe(function () { return Lampa.Utils.hash(title); }) || Date.now();

        return {
            id: id,
            title: title,
            name: '',
            original_title: title,
            original_name: title,
            source: 'tmdb',
            release_date: '0000',
            first_air_date: '',
            runtime: 0
        };
    }

    function openShowy(query) {
        query = (query || '').trim();

        if (!query) {
            notify('Введите название для поиска');
            return;
        }

        ensureShowy(function () {
            safe(function () {
                Lampa.Activity.push({
                    url: '',
                    title: 'Showy',
                    component: 'showy',
                    search: query,
                    search_one: query,
                    search_two: query,
                    movie: makeMovie(query),
                    page: 1,
                    clarification: true,
                    noinfo: true
                });
            });
        });
    }

    function openSearch() {
        ensureShowy(function () {
            var done = function (value) {
                openShowy(value);
            };

            if (Lampa.Input && typeof Lampa.Input.edit === 'function') {
                Lampa.Input.edit({
                    title: 'Showy',
                    value: '',
                    placeholder: 'Введите название',
                    free: true
                }, done, function () {
                    safe(function () { Lampa.Controller.toggle('menu'); });
                });
            } else {
                var value = window.prompt ? window.prompt('Showy') : '';
                done(value || '');
            }
        });
    }

    function addNativeMenuButton() {
        if (!Lampa.Menu || typeof Lampa.Menu.addButton !== 'function') return false;

        Lampa.Menu.addButton(icon(), 'Showy', openSearch);
        menuAdded = true;
        return true;
    }

    function menuRoot() {
        return $('.menu .menu__case').first();
    }

    function addDomMenuButton() {
        var root = menuRoot();
        if (!root.length) return false;
        if (root.find('[data-action="' + COMPONENT + '"]').length) {
            menuAdded = true;
            return true;
        }

        var item = $(
            '<li class="menu__item selector" data-action="' + COMPONENT + '">' +
                '<div class="menu__ico">' + icon() + '</div>' +
                '<div class="menu__text">Showy</div>' +
            '</li>'
        );

        item.on('hover:enter click', function (e) {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
            openSearch();
        });

        root.append(item);
        menuAdded = true;
        return true;
    }

    function addMenuButton() {
        if (menuAdded) return true;
        if (addNativeMenuButton()) return true;
        return addDomMenuButton();
    }

    function scheduleMenuAttempt(delay) {
        setTimeout(function () {
            if (menuAdded || attemptsLeft <= 0) return;

            attemptsLeft--;
            if (!addMenuButton()) scheduleMenuAttempt(700);
        }, delay || 0);
    }

    function start() {
        if (window.showy_menu_plugin) return;
        window.showy_menu_plugin = true;

        ensureShowy(function () {});
        scheduleMenuAttempt(300);
        scheduleMenuAttempt(1300);
        scheduleMenuAttempt(3000);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event && event.type === 'ready') start();
        });
    }
})();
