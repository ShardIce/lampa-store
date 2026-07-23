/*
 * name: Custom Online
 * author: @shardice
 * version: 1.0.0
 * description: Добавляет в карточку Lampa настраиваемую кнопку онлайн-источника для авторизованного JSON API.
 */

(function () {
    'use strict';

    if (window.home_custom_online_ready) return;
    window.home_custom_online_ready = true;

    var COMPONENT = 'custom_online_source';
    var BUTTON_COMPONENT = 'custom_online_source_button';
    var DEFAULT_BUTTON_TITLE = 'MY API';
    var REQUEST_TIMEOUT = 15000;
    var manifestPlugin = null;

    function addLang() {
        Lampa.Lang.add({
            custom_online_settings_title: {
                ru: 'Custom Online',
                en: 'Custom Online',
                uk: 'Custom Online'
            },
            custom_online_api_title: {
                ru: 'API источник',
                en: 'API source',
                uk: 'API джерело'
            },
            custom_online_api_descr: {
                ru: 'GET endpoint с JSON-ответом и разрешёнными ссылками на видео.',
                en: 'GET endpoint with a JSON response and authorized video links.',
                uk: 'GET endpoint з JSON-відповіддю і дозволеними посиланнями на відео.'
            },
            custom_online_api_placeholder: {
                ru: 'Например: https://example.com/lampa/search',
                en: 'Example: https://example.com/lampa/search',
                uk: 'Наприклад: https://example.com/lampa/search'
            },
            custom_online_button_title: {
                ru: 'Название кнопки',
                en: 'Button title',
                uk: 'Назва кнопки'
            },
            custom_online_button_descr: {
                ru: 'Будет показано в выборе источника просмотра.',
                en: 'Shown in the watch source selector.',
                uk: 'Буде показано у виборі джерела перегляду.'
            },
            custom_online_no_api: {
                ru: 'Укажите API источник в настройках Custom Online.',
                en: 'Set the API source in Custom Online settings.',
                uk: 'Вкажіть API джерело в налаштуваннях Custom Online.'
            },
            custom_online_no_results: {
                ru: 'Нет доступных ссылок для этого фильма.',
                en: 'No available links for this title.',
                uk: 'Немає доступних посилань для цього фільму.'
            },
            custom_online_load_error: {
                ru: 'Не удалось загрузить источник.',
                en: 'Failed to load the source.',
                uk: 'Не вдалося завантажити джерело.'
            },
            custom_online_open_settings: {
                ru: 'Настройки Custom Online',
                en: 'Custom Online settings',
                uk: 'Налаштування Custom Online'
            }
        });
    }

    function addCss() {
        if ($('#custom-online-source-style-v1').length) return;

        $('body').append('<style id="custom-online-source-style-v1">' +
            '.custom-online-item .online__body{min-height:3.1em;}' +
            '.custom-online-item__title{font-weight:800;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.custom-online-item__meta{margin-top:.38em;color:rgba(255,255,255,.55);font-size:.78em;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.custom-online-item.focus .custom-online-item__meta,.custom-online-item.hover .custom-online-item__meta{color:rgba(0,0,0,.62);}' +
        '</style>');
    }

    function initParams() {
        try {
            if (Lampa.Params && typeof Lampa.Params.select === 'function') {
                Lampa.Params.select('custom_online_api_url', '', '');
                Lampa.Params.select('custom_online_button_title', DEFAULT_BUTTON_TITLE, DEFAULT_BUTTON_TITLE);
            }
        } catch (e) {}
    }

    function getStorage(name, fallback) {
        try {
            return Lampa.Storage.get(name, fallback);
        } catch (e) {
            return fallback;
        }
    }

    function setStorage(name, value) {
        try {
            Lampa.Storage.set(name, value);
        } catch (e) {}
    }

    function trim(value) {
        return String(value == null ? '' : value).replace(/^\s+|\s+$/g, '');
    }

    function buttonTitle() {
        return trim(getStorage('custom_online_button_title', DEFAULT_BUTTON_TITLE)) || DEFAULT_BUTTON_TITLE;
    }

    function apiUrl() {
        return trim(getStorage('custom_online_api_url', ''));
    }

    function yearOf(card) {
        return String((card && (card.release_date || card.first_air_date || card.year)) || '').slice(0, 4);
    }

    function typeOf(card) {
        if (!card) return 'movie';
        return card.name || card.original_name || card.first_air_date ? 'tv' : 'movie';
    }

    function queryOf(object) {
        var card = (object && object.movie) || {};
        var title = card.title || card.name || object.search || '';
        var original = card.original_title || card.original_name || object.search_two || '';

        return {
            title: title,
            query: title,
            original_title: original,
            year: yearOf(card),
            type: typeOf(card),
            tmdb_id: card.source === 'tmdb' || card.source === 'cub' ? card.id : '',
            imdb_id: card.imdb_id || '',
            kinopoisk_id: card.kinopoisk_id || card.kp_id || card.kpId || '',
            source: card.source || ''
        };
    }

    function addUrlParam(url, name, value) {
        if (value === null || typeof value === 'undefined' || value === '') return url;

        var pair = encodeURIComponent(name) + '=' + encodeURIComponent(value);

        try {
            if (Lampa.Utils && typeof Lampa.Utils.addUrlComponent === 'function') {
                return Lampa.Utils.addUrlComponent(url, pair);
            }
        } catch (e) {}

        return url + (url.indexOf('?') >= 0 ? '&' : '?') + pair;
    }

    function buildRequestUrl(object) {
        var url = apiUrl();
        var query = queryOf(object);
        var templated = false;

        url = url.replace(/\{([a-z0-9_]+)\}/gi, function (match, key) {
            templated = true;
            return encodeURIComponent(query[key] || '');
        });

        if (!templated) {
            keys(query).forEach(function (key) {
                url = addUrlParam(url, key, query[key]);
            });
        }

        return url;
    }

    function isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    function keys(object) {
        var result = [];
        var key;

        object = object || {};

        for (key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) result.push(key);
        }

        return result;
    }

    function firstString() {
        for (var i = 0; i < arguments.length; i++) {
            var value = arguments[i];
            if (typeof value === 'string' && trim(value)) return trim(value);
        }

        return '';
    }

    function playableUrl(item) {
        return firstString(
            item && item.url,
            item && item.file,
            item && item.src,
            item && item.stream,
            item && item.link,
            item && item.href,
            item && item.hls,
            item && item.m3u8,
            item && item.mp4
        );
    }

    function normalizeQuality(map) {
        var result = {};

        if (!map || typeof map !== 'object' || isArray(map)) return result;

        keys(map).forEach(function (name) {
            var value = map[name];
            var url = typeof value === 'string' ? value : playableUrl(value || {});

            if (url) result[name] = url;
        });

        return result;
    }

    function qualityMap(item) {
        return normalizeQuality(
            item && (
                item.quality && typeof item.quality === 'object' ? item.quality :
                item.qualities || item.links || item.files_by_quality || item.sources_by_quality
            )
        );
    }

    function firstQualityUrl(quality) {
        var names = keys(quality);
        return names.length ? quality[names[0]] : '';
    }

    function hasPlayable(item) {
        return !!(item && (playableUrl(item) || firstQualityUrl(qualityMap(item))));
    }

    function getArray(data) {
        var variants = ['results', 'items', 'videos', 'streams', 'files', 'playlist', 'episodes', 'seasons', 'data'];

        if (isArray(data)) return data;

        for (var i = 0; i < variants.length; i++) {
            if (data && isArray(data[variants[i]])) return data[variants[i]];
        }

        if (data && data.data && typeof data.data === 'object') return getArray(data.data);

        return [];
    }

    function mergeContext(parent, item) {
        var context = {};
        var source = parent || {};

        keys(source).forEach(function (key) {
            context[key] = source[key];
        });

        ['season', 'episode', 'voice', 'translation', 'quality_label', 'source_title'].forEach(function (key) {
            if (typeof item[key] !== 'undefined' && item[key] !== null && item[key] !== '') context[key] = item[key];
        });

        if (item.title || item.name) context.source_title = item.title || item.name;

        return context;
    }

    function nestedArrays(item) {
        var result = [];

        ['results', 'items', 'videos', 'streams', 'files', 'playlist', 'episodes', 'seasons', 'children'].forEach(function (key) {
            if (item && isArray(item[key])) result = result.concat(item[key]);
        });

        return result;
    }

    function displayTitle(item, context, object) {
        var card = object.movie || {};
        var base = item.title || item.name || context.source_title || card.title || card.name || 'Video';
        var season = item.season || context.season;
        var episode = item.episode || item.episode_number || context.episode;

        if (season && episode) return 'S' + season + ' / E' + episode + ' - ' + base;
        if (episode) return 'E' + episode + ' - ' + base;

        return base;
    }

    function displayMeta(item, quality, context) {
        var meta = [];
        var qualityNames = keys(quality);
        var qualityText = typeof item.quality === 'string' ? item.quality : '';
        var voice = item.voice || item.translation || context.voice || context.translation || '';
        var info = item.info || item.description || item.subtitle || '';

        if (!qualityText && qualityNames.length) qualityText = qualityNames.join(' / ');
        if (qualityText) meta.push(qualityText);
        if (voice) meta.push(voice);
        if (info) meta.push(info);

        return meta.join(' • ');
    }

    function normalizeSubs(subs) {
        if (!isArray(subs)) return undefined;

        return subs.map(function (sub, index) {
            if (typeof sub === 'string') {
                return { index: index, label: 'Sub ' + (index + 1), url: sub };
            }

            return {
                index: typeof sub.index !== 'undefined' ? sub.index : index,
                label: sub.label || sub.title || sub.language || ('Sub ' + (index + 1)),
                url: sub.url || sub.file || sub.src
            };
        }).filter(function (sub) {
            return !!sub.url;
        });
    }

    function normalizeItem(item, context, object) {
        var quality = qualityMap(item);
        var url = playableUrl(item) || firstQualityUrl(quality);
        var subtitles = normalizeSubs(item.subtitles || item.subs);

        return {
            title: displayTitle(item, context, object),
            meta: displayMeta(item, quality, context),
            url: url,
            quality: keys(quality).length ? quality : undefined,
            subtitles: subtitles && subtitles.length ? subtitles : undefined,
            season: item.season || context.season,
            episode: item.episode || item.episode_number || context.episode,
            raw: item
        };
    }

    function flatten(input, context, output, object) {
        if (!input) return;

        if (isArray(input)) {
            input.forEach(function (item) {
                flatten(item, context, output, object);
            });
            return;
        }

        if (typeof input !== 'object') return;

        var nextContext = mergeContext(context, input);
        var nested = nestedArrays(input);

        if (hasPlayable(input)) output.push(normalizeItem(input, nextContext, object));
        if (nested.length) flatten(nested, nextContext, output, object);
    }

    function normalizeResponse(data, object) {
        var output = [];

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = {};
            }
        }

        if (hasPlayable(data)) output.push(normalizeItem(data, {}, object));
        flatten(getArray(data), {}, output, object);

        return output.filter(function (item, index, list) {
            var duplicate = false;
            var i;

            if (!item.url) return false;

            for (i = 0; i < index; i++) {
                if (list[i].url === item.url && list[i].title === item.title) {
                    duplicate = true;
                    break;
                }
            }

            return !duplicate;
        });
    }

    function itemHash(item, object) {
        var card = object.movie || {};
        var key = [
            'custom_online',
            card.id || '',
            card.original_title || card.original_name || card.title || card.name || '',
            item.season || '',
            item.episode || '',
            item.title || ''
        ].join('|');

        try {
            return Lampa.Utils.hash(key);
        } catch (e) {
            return key;
        }
    }

    function timelineFor(item, object) {
        try {
            return Lampa.Timeline.view(itemHash(item, object));
        } catch (e) {
            return false;
        }
    }

    function playData(item, object) {
        var card = object.movie || {};
        var data = {
            url: item.url,
            title: (card.title || card.name || object.search || buttonTitle()) + ' / ' + item.title,
            card: card
        };

        if (item.quality) data.quality = item.quality;
        if (item.subtitles) data.subtitles = item.subtitles;
        if (item.timeline) data.timeline = item.timeline;

        return data;
    }

    function SourceComponent(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var files = Lampa.Files ? new Lampa.Files(object) : false;
        var html = $('<div class="custom-online-screen"></div>');
        var current = [];
        var last = false;

        function renderRoot() {
            return files ? files.render() : html;
        }

        function minus() {
            try {
                if (files) scroll.minus(window.innerWidth > 580 ? false : files.render().find('.files__left'));
                else scroll.minus();
            } catch (e) {}
        }

        function stopEvent(e) {
            if (!e) return;
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
        }

        function empty(message) {
            var item = Lampa.Template.get('list_empty');

            if (message) item.find('.empty__descr').text(message);

            scroll.clear();
            scroll.append(item);
            loading.call(this, false);
        }

        function loading(status) {
            try {
                this.activity.loader(status);
                if (!status) this.activity.toggle();
            } catch (e) {}
        }

        function createItem(item, index) {
            var view = timelineFor(item, object);
            var element = $('<div class="online selector custom-online-item">' +
                '<div class="online__body">' +
                    '<div class="custom-online-item__title"></div>' +
                    '<div class="custom-online-item__meta"></div>' +
                '</div>' +
            '</div>');

            item.timeline = view;
            element.find('.custom-online-item__title').text(item.title);
            element.find('.custom-online-item__meta').text(item.meta || buttonTitle());

            if (view && Lampa.Timeline && typeof Lampa.Timeline.render === 'function') {
                element.append(Lampa.Timeline.render(view));
            }

            element.on('hover:focus', function (e) {
                last = e.target;
                scroll.update($(e.target), true);
            });

            element.on('hover:enter click', function (e) {
                var playlist;
                var first;

                stopEvent(e);

                try {
                    if (object.movie && object.movie.id && Lampa.Favorite) {
                        Lampa.Favorite.add('history', object.movie, 100);
                    }
                } catch (historyError) {}

                playlist = current.map(function (entry) {
                    return playData(entry, object);
                });
                first = playData(item, object);

                if (playlist.length > 1) first.playlist = playlist;

                Lampa.Player.play(first);
                Lampa.Player.playlist(playlist.length ? playlist : [first]);

                last = element[0];
            });

            if (index === 0) last = element[0];

            return element;
        }

        function renderItems(items) {
            current = items || [];
            scroll.clear();

            if (!current.length) {
                empty.call(this, Lampa.Lang.translate('custom_online_no_results'));
                return;
            }

            current.forEach(function (item, index) {
                scroll.append(createItem(item, index));
            });

            loading.call(this, false);
        }

        function request() {
            var url = buildRequestUrl(object);
            var that = this;

            if (!url) {
                empty.call(that, Lampa.Lang.translate('custom_online_no_api'));
                return;
            }

            network.clear();
            network.timeout(REQUEST_TIMEOUT);
            network.native(url, function (json) {
                renderItems.call(that, normalizeResponse(json, object));
            }, function (a, c) {
                var message = Lampa.Lang.translate('custom_online_load_error');

                try {
                    if (network.errorDecode) message = network.errorDecode(a, c);
                } catch (e) {}

                empty.call(that, message);
            });
        }

        this.create = function () {
            this.activity.loader(true);

            addCss();
            minus();

            if (files) files.append(scroll.render());
            else html.append(scroll.render());

            request.call(this);

            return this.render();
        };

        this.start = function () {
            if (Lampa.Activity.active().activity !== this.activity) return;

            try {
                Lampa.Background.immediately(Lampa.Utils.cardImgBackground(object.movie));
            } catch (e) {}

            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render(), files ? files.render() : html);
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function () {
                    if (window.Navigator && Navigator.canmove && Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (window.Navigator && Navigator.move) Navigator.move('down');
                },
                right: function () {
                    if (window.Navigator && Navigator.canmove && Navigator.canmove('right')) Navigator.move('right');
                },
                left: function () {
                    if (window.Navigator && Navigator.canmove && Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                back: this.back
            });

            Lampa.Controller.toggle('content');
        };

        this.back = function () {
            Lampa.Activity.backward();
        };

        this.pause = function () {};

        this.stop = function () {};

        this.render = renderRoot;

        this.destroy = function () {
            network.clear();
            scroll.destroy();
            if (files && files.destroy) files.destroy();
            html.remove();
            window.removeEventListener('resize', minus);
            current = [];
            network = null;
        };

        window.addEventListener('resize', minus, false);
    }

    function launch(card) {
        card = card || {};

        Lampa.Component.add(COMPONENT, SourceComponent);

        Lampa.Activity.push({
            url: '',
            title: buttonTitle(),
            component: COMPONENT,
            search: card.title || card.name || '',
            search_one: card.title || card.name || '',
            search_two: card.original_title || card.original_name || '',
            movie: card,
            page: 1
        });
    }

    function fullButtonHtml() {
        return '<div class="full-start__button selector view--custom-online" data-component="' + BUTTON_COMPONENT + '" data-subtitle="Custom Online">' +
            '<svg><use xlink:href="#sprite-play"></use></svg>' +
            '<span></span>' +
        '</div>';
    }

    function addFullButton(e) {
        var activity;
        var render;
        var btn;
        var anchor;
        var container;
        var card;

        if (!e || e.type !== 'complite' || !e.object || !e.object.activity) return;

        activity = e.object.activity;
        if (!activity.render) return;

        render = activity.render();
        if (!render || !render.length || render.find('[data-component="' + BUTTON_COMPONENT + '"]').length) return;

        card = e.data && e.data.movie || e.object.card || {};
        btn = $(fullButtonHtml());
        btn.find('span').text(buttonTitle());
        btn.on('hover:enter click', function (event) {
            if (event && event.preventDefault) event.preventDefault();
            launch(card);
        });

        anchor = render.find('.buttons--container > .view--torrent').last();
        if (!anchor.length) anchor = render.find('.buttons--container > .view--online').last();
        if (anchor.length) {
            anchor.after(btn);
            return;
        }

        container = render.find('.buttons--container').first();
        if (container.length) {
            container.append(btn);
            return;
        }

        container = render.find('.full-start-new__buttons').first();
        if (container.length) container.prepend(btn);
    }

    function addSettings() {
        var settings = Lampa.Settings && Lampa.Settings.main ? Lampa.Settings.main() : false;
        var field;

        if (!settings || !settings.render || settings.render().find('[data-component="' + COMPONENT + '"]').length) return;

        field = $(Lampa.Lang.translate('<div class="settings-folder selector" data-component="' + COMPONENT + '">' +
            '<div class="settings-folder__icon">' +
                '<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<rect x="4" y="8" width="36" height="28" rx="4" stroke="white" stroke-width="3"/>' +
                    '<path d="M26.5 22L18.5 27V17L26.5 22Z" fill="white"/>' +
                    '<path d="M8 13H36" stroke="white" stroke-width="3" stroke-linecap="round"/>' +
                '</svg>' +
            '</div>' +
            '<div class="settings-folder__name">#{custom_online_settings_title}</div>' +
        '</div>'));

        settings.render().find('[data-component="more"]').after(field);
        settings.update();
    }

    function addSettingsTemplate() {
        Lampa.Template.add('settings_' + COMPONENT, '<div>' +
            '<div class="settings-param selector" data-type="input" data-name="custom_online_api_url" placeholder="#{custom_online_api_placeholder}">' +
                '<div class="settings-param__name">#{custom_online_api_title}</div>' +
                '<div class="settings-param__value"></div>' +
                '<div class="settings-param__descr">#{custom_online_api_descr}</div>' +
            '</div>' +
            '<div class="settings-param selector" data-type="input" data-name="custom_online_button_title" placeholder="' + DEFAULT_BUTTON_TITLE + '">' +
                '<div class="settings-param__name">#{custom_online_button_title}</div>' +
                '<div class="settings-param__value"></div>' +
                '<div class="settings-param__descr">#{custom_online_button_descr}</div>' +
            '</div>' +
        '</div>');
    }

    function registerManifest() {
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: buttonTitle(),
            description: 'Custom Online',
            component: COMPONENT,
            onContextMenu: function () {
                return {
                    name: buttonTitle(),
                    description: ''
                };
            },
            onContextLauch: launch
        };

        manifestPlugin = manifest;
        Lampa.Manifest.plugins = manifestPlugin;
    }

    function startPlugin() {
        addLang();
        addCss();
        initParams();
        addSettingsTemplate();
        registerManifest();

        Lampa.Component.add(COMPONENT, SourceComponent);

        if (window.appready) addSettings();

        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') addSettings();
        });

        Lampa.Listener.follow('full', addFullButton);

        if (Lampa.Storage && Lampa.Storage.listener && Lampa.Storage.listener.follow) {
            Lampa.Storage.listener.follow('change', function (e) {
                if (e.name === 'custom_online_button_title') {
                    $('[data-component="' + BUTTON_COMPONENT + '"] span').text(buttonTitle());
                    if (manifestPlugin) manifestPlugin.name = buttonTitle();
                }

                if (e.name === 'custom_online_button_title' && !trim(e.value)) {
                    setStorage('custom_online_button_title', DEFAULT_BUTTON_TITLE);
                }
            });
        }
    }

    startPlugin();
})();
