/*
 * name: Lampa Clean TV
 * author: shardice
 * version: 1.0.0
 * description: Чистый TV-режим для Lampa: применяет настройки интерфейса и аккуратно скрывает лишние сервисные элементы без постоянного сканирования DOM.
 */

(function () {
    'use strict';

    var STYLE_ID = 'lampa-clean-tv-style-v1';
    var ready = false;
    var listenersBound = false;

    function safe(fn) {
        try {
            return fn();
        } catch (e) {
            return null;
        }
    }

    function notify(message) {
        safe(function () {
            if (Lampa.Noty && typeof Lampa.Noty.show === 'function') {
                Lampa.Noty.show(message);
            }
        });
    }

    function allowedOrigin() {
        var origin = safe(function () {
            return Lampa.Manifest && Lampa.Manifest.origin;
        });

        if (origin && origin !== 'bylampa') {
            notify('Ошибка доступа');
            return false;
        }

        return true;
    }

    function setValue(object, key, value) {
        if (object) object[key] = value;
    }

    function applySettings() {
        var settings = window.lampa_settings = window.lampa_settings || {};

        setValue(settings, 'socket_use', false);
        setValue(settings, 'socket_url', undefined);
        setValue(settings, 'socket_methods', false);
        setValue(settings, 'account_use', true);
        setValue(settings, 'account_sync', true);
        setValue(settings, 'plugins_use', true);
        setValue(settings, 'plugins_store', true);
        setValue(settings, 'torrents_use', true);
        setValue(settings, 'white_use', false);
        setValue(settings, 'lang_use', true);
        setValue(settings, 'read_only', false);
        setValue(settings, 'dcma', false);
        setValue(settings, 'dmca', false);
        setValue(settings, 'push_state', true);
        setValue(settings, 'iptv', false);
        setValue(settings, 'feed', false);
        setValue(settings, 'geo', false);
        setValue(settings, 'mirrors', true);

        settings.disable_features = settings.disable_features || {};
        setValue(settings.disable_features, 'dmca', true);
        setValue(settings.disable_features, 'reactions', true);
        setValue(settings.disable_features, 'discuss', true);
        setValue(settings.disable_features, 'ai', true);
        setValue(settings.disable_features, 'subscribe', true);
        setValue(settings.disable_features, 'blacklist', true);
        setValue(settings.disable_features, 'persons', true);
        setValue(settings.disable_features, 'ads', true);
        setValue(settings.disable_features, 'trailers', false);
        setValue(settings.disable_features, 'install_proxy', true);

        settings.developer = settings.developer || {};
        setValue(settings.developer, 'ads', false);
        setValue(settings.developer, 'enabled', false);
        setValue(settings.developer, 'fps', false);
        setValue(settings.developer, 'nodemo', false);
        setValue(settings.developer, 'nopremium', false);
    }

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.innerHTML =
            '.icon--blink,' +
            '.black-friday__button,' +
            '.christmas__button,' +
            '.womens_day__button,' +
            '.button--subscribe,' +
            '.notice--icon{' +
                'display:none!important;' +
            '}';

        document.body.appendChild(style);
    }

    function removeElements(selector, root) {
        safe(function () {
            var scope = root && root.length ? root : $(document);
            scope.find(selector).remove();
        });
    }

    function removeGlobal(selector) {
        safe(function () {
            $(selector).remove();
        });
    }

    function removeConsoleItem(root) {
        safe(function () {
            var scope = root && root.length ? root : $(document);

            scope.find('div > span').filter(function () {
                return ($(this).text() || '').trim() === 'Консоль';
            }).parent().remove();
        });
    }

    function removeSportsItem() {
        safe(function () {
            $('#app > div.wrap.layer--height.layer--width > div.wrap__left.layer--height > div > div > div > div > div > div:nth-child(1) > ul > li')
                .filter(function () {
                    return ($(this).text() || '').indexOf('Спорт') > -1;
                })
                .eq(0)
                .remove();
        });
    }

    function cleanupCommon() {
        removeGlobal('.open--broadcast');
        removeGlobal('.selectbox-item--icon');
        removeGlobal('.ad-server');
        removeGlobal('.button--subscribe');
        removeGlobal('.button--options');
        removeSportsItem();
        removeConsoleItem();
    }

    function cleanupActivity() {
        safe(function () {
            if (!Lampa.Activity || typeof Lampa.Activity.active !== 'function') return;

            var activity = Lampa.Activity.active();
            var component = activity && activity.component;

            if (component === 'full') {
                removeGlobal('.ad-server');
                removeGlobal('.button--options');
            }

            if (component === 'more') {
                removeGlobal('.button--subscribe');
            }
        });
    }

    function cleanupSettings(event) {
        if (!event || !event.body) return;

        if (event.name === 'server') {
            removeGlobal('.ad-server');
        }

        if (event.name === 'interface') {
            removeElements('[data-name="card_quality"]', event.body);
            removeElements('[data-action="timetable"]', event.body);
            removeElements('[data-name="terminal"]', event.body);
            removeConsoleItem(event.body);
        }

        if (event.name === 'more') {
            removeElements('[data-name="card_interfice_reactions"]', event.body);
        }
    }

    function bindListeners() {
        if (listenersBound) return;
        listenersBound = true;

        safe(function () {
            Lampa.Controller.listener.follow('toggle', function (event) {
                if (event && event.name === 'select') {
                    setTimeout(cleanupActivity, 20);
                }
            });
        });

        safe(function () {
            Lampa.Settings.listener.follow('open', cleanupSettings);
        });

        safe(function () {
            Lampa.Listener.follow('full', function (event) {
                if (event && event.type === 'complite') {
                    setTimeout(function () {
                        removeGlobal('.button--options');
                    }, 0);
                }
            });
        });
    }

    function start() {
        if (ready) return;
        ready = true;

        if (!allowedOrigin()) return;

        safe(function () {
            if (Lampa.Platform && typeof Lampa.Platform.tv === 'function') {
                Lampa.Platform.tv();
            }
        });

        applySettings();
        addStyle();
        bindListeners();

        setTimeout(cleanupCommon, 300);
        setTimeout(cleanupCommon, 1000);
        setTimeout(cleanupActivity, 1200);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event && event.type === 'ready') start();
        });
    }
})();
