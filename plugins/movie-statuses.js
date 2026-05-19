(function () {
    'use strict';

    var PLUGIN_ID = 'ak_movie_statuses';
    var STORAGE_KEY = 'ak_lampa_movie_statuses_v1';
    var STYLE_ID = 'ak-movie-statuses-style';
    var injected = false;

    var statuses = [
        { id: 'watching', title: 'Смотрю', icon: '▶' },
        { id: 'planned', title: 'Буду смотреть', icon: '＋' },
        { id: 'watched', title: 'Просмотрено', icon: '✓' },
        { id: 'paused', title: 'Отложено', icon: 'Ⅱ' },
        { id: 'dropped', title: 'Брошено', icon: '×' }
    ];

    function log() {
        try {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('[Movie Statuses]');
            console.log.apply(console, args);
        } catch (e) {}
    }

    function notify(message) {
        try {
            if (window.Lampa && Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(message);
            else if (window.Lampa && Lampa.Notice && Lampa.Notice.show) Lampa.Notice.show(message);
            else log(message);
        } catch (e) {
            log(message);
        }
    }

    function readDb() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
        } catch (e) {
            return {};
        }
    }

    function writeDb(db) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db || {}));
    }

    function getActiveCard() {
        try {
            if (window.Lampa && Lampa.Activity && Lampa.Activity.active) {
                var active = Lampa.Activity.active();
                if (active) {
                    if (active.card) return active.card;
                    if (active.movie) return active.movie;
                    if (active.object) return active.object;
                    if (active.params && active.params.card) return active.params.card;
                    if (active.params && active.params.movie) return active.params.movie;
                    if (active.component && active.component.card) return active.component.card;
                }
            }
        } catch (e) {}

        return null;
    }

    function getCardKey(card) {
        if (!card) return '';

        var type = card.media_type || card.type || (card.name && !card.title ? 'tv' : 'movie');
        var id = card.id || card.tmdb_id || card.kinopoisk_id || card.imdb_id;

        if (id) return type + ':' + id;

        var title = card.title || card.name || card.original_title || card.original_name || '';
        var date = card.release_date || card.first_air_date || '';

        if (!title) return '';

        return type + ':' + title.toLowerCase() + ':' + String(date).slice(0, 4);
    }

    function getCardTitle(card) {
        if (!card) return 'Без названия';
        return card.title || card.name || card.original_title || card.original_name || 'Без названия';
    }

    function getStatus(id) {
        for (var i = 0; i < statuses.length; i++) {
            if (statuses[i].id === id) return statuses[i];
        }
        return null;
    }

    function setStatus(card, statusId) {
        var key = getCardKey(card);
        if (!key) {
            notify('Не удалось определить карточку');
            return;
        }

        var db = readDb();
        var status = getStatus(statusId);

        if (!status) {
            delete db[key];
            writeDb(db);
            notify('Статус удалён');
            updateBadges();
            return;
        }

        db[key] = {
            status: status.id,
            title: getCardTitle(card),
            type: card.media_type || card.type || 'movie',
            tmdb_id: card.id || card.tmdb_id || null,
            poster_path: card.poster_path || null,
            updated_at: Date.now()
        };

        writeDb(db);
        notify('Статус: ' + status.title);
        updateBadges();
    }

    function getCurrentStatus(card) {
        var key = getCardKey(card);
        if (!key) return null;
        return readDb()[key] || null;
    }

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var css = '' +
            '.ak-status-btn{margin-top:1em;padding:.75em 1em;border-radius:.8em;background:rgba(255,255,255,.08);color:#fff;font-size:1.05em;display:flex;align-items:center;justify-content:space-between;gap:.75em}' +
            '.ak-status-btn.focus,.ak-status-btn:hover{background:rgba(255,255,255,.18)}' +
            '.ak-status-badge{display:inline-flex;align-items:center;gap:.35em;padding:.28em .55em;border-radius:.55em;background:rgba(255,255,255,.16);font-size:.75em;margin:.35em 0;color:#fff}' +
            '.ak-status-list{padding:1em}' +
            '.ak-status-item{padding:.85em 1em;margin-bottom:.55em;border-radius:.75em;background:rgba(255,255,255,.08);color:#fff}' +
            '.ak-status-item.focus,.ak-status-item:hover{background:rgba(255,255,255,.18)}' +
            '.ak-status-empty{opacity:.75;padding:1em;line-height:1.5}' +
            '.ak-status-title{font-size:1.15em;font-weight:600;margin-bottom:.2em}' +
            '.ak-status-meta{font-size:.85em;opacity:.7}';

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);
    }

    function openStatusSelector(card) {
        card = card || getActiveCard();

        if (!card) {
            notify('Открой карточку фильма или сериала');
            return;
        }

        var current = getCurrentStatus(card);
        var html = $('<div class="ak-status-list"></div>');

        statuses.forEach(function (status) {
            var active = current && current.status === status.id;
            var item = $('<div class="ak-status-item selector" data-status="' + status.id + '">' + status.icon + ' ' + status.title + (active ? ' — выбран' : '') + '</div>');
            html.append(item);
        });

        html.append('<div class="ak-status-item selector" data-status="remove">Убрать статус</div>');

        html.find('.ak-status-item').on('hover:enter click', function () {
            var value = $(this).data('status');
            setStatus(card, value === 'remove' ? null : value);
            try { Lampa.Modal.close(); } catch (e) {}
        });

        try {
            Lampa.Modal.open({
                title: 'Статус: ' + getCardTitle(card),
                html: html,
                size: 'medium',
                onBack: function () { Lampa.Modal.close(); }
            });
        } catch (e) {
            notify('Окно статусов недоступно');
            log(e);
        }
    }

    function renderStatusList(statusId) {
        var db = readDb();
        var rows = Object.keys(db).map(function (key) {
            var item = db[key];
            item.key = key;
            return item;
        }).filter(function (item) {
            return !statusId || item.status === statusId;
        }).sort(function (a, b) {
            return (b.updated_at || 0) - (a.updated_at || 0);
        });

        var html = $('<div class="ak-status-list"></div>');

        if (!rows.length) {
            html.append('<div class="ak-status-empty">Пока нет фильмов с этим статусом. Открой карточку фильма и нажми “Статус”.</div>');
        } else {
            rows.forEach(function (item) {
                var status = getStatus(item.status) || { title: item.status || 'Статус', icon: '•' };
                var date = item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '';
                html.append('<div class="ak-status-item selector"><div class="ak-status-title">' + escapeHtml(item.title || 'Без названия') + '</div><div class="ak-status-meta">' + status.icon + ' ' + status.title + (date ? ' · ' + date : '') + '</div></div>');
            });
        }

        return html;
    }

    function openStatusLibrary() {
        var root = $('<div class="ak-status-list"></div>');

        root.append('<div class="ak-status-item selector" data-filter="all">Все статусы</div>');
        statuses.forEach(function (status) {
            root.append('<div class="ak-status-item selector" data-filter="' + status.id + '">' + status.icon + ' ' + status.title + '</div>');
        });

        root.find('.ak-status-item').on('hover:enter click', function () {
            var filter = $(this).data('filter');
            var title = filter === 'all' ? 'Все статусы' : (getStatus(filter) || {}).title;
            try { Lampa.Modal.close(); } catch (e) {}
            setTimeout(function () {
                Lampa.Modal.open({
                    title: title || 'Статусы',
                    html: renderStatusList(filter === 'all' ? null : filter),
                    size: 'medium',
                    onBack: function () { Lampa.Modal.close(); }
                });
            }, 100);
        });

        try {
            Lampa.Modal.open({
                title: 'Мои статусы',
                html: root,
                size: 'medium',
                onBack: function () { Lampa.Modal.close(); }
            });
        } catch (e) {
            notify('Не удалось открыть список статусов');
            log(e);
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function findFullCardContainer() {
        var selectors = [
            '.full-start-new__buttons',
            '.full-start__buttons',
            '.full-start-new',
            '.full-start',
            '.full',
            '.card'
        ];

        for (var i = 0; i < selectors.length; i++) {
            var node = $(selectors[i]).first();
            if (node.length) return node;
        }

        return $();
    }

    function addButtonToCard() {
        if (!window.Lampa || !window.$) return;

        injectStyle();

        var card = getActiveCard();
        var container = findFullCardContainer();

        if (!container.length || container.find('.ak-status-btn').length) return;

        var current = getCurrentStatus(card);
        var status = current ? getStatus(current.status) : null;
        var label = status ? status.icon + ' ' + status.title : 'Добавить статус';

        var button = $('<div class="ak-status-btn selector" data-action="ak-status"><span>Статус</span><span class="ak-status-btn__value">' + label + '</span></div>');

        button.on('hover:enter click', function () {
            openStatusSelector(card || getActiveCard());
        });

        container.append(button);

        try {
            if (Lampa.Controller && Lampa.Controller.collectionSet) Lampa.Controller.collectionSet(container);
        } catch (e) {}
    }

    function updateBadges() {
        $('.ak-status-btn').remove();
        setTimeout(addButtonToCard, 50);
    }

    function addSettingsMenu() {
        try {
            if (!Lampa.Settings || !Lampa.Settings.main) return;

            var settings = Lampa.Settings.main();
            var render = settings.render();

            if (render.find('[data-component="ak_movie_statuses"]').length) return;

            var item = $('<div class="settings-param selector" data-component="ak_movie_statuses"><div class="settings-param__name">Мои статусы</div><div class="settings-param__descr">Список фильмов и сериалов по статусам</div></div>');

            var more = render.find('[data-component="more"]');
            if (more.length) more.after(item);
            else render.append(item);

            settings.update();
        } catch (e) {
            log('settings menu error', e);
        }
    }

    function bindSettingsOpen() {
        try {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name === 'main') {
                    addSettingsMenu();
                    e.body.find('[data-component="ak_movie_statuses"]').off('hover:enter click').on('hover:enter click', function () {
                        openStatusLibrary();
                    });
                }
            });
        } catch (e) {
            log('settings listener error', e);
        }
    }

    function observeCards() {
        setInterval(function () {
            addButtonToCard();
        }, 1200);
    }

    function init() {
        if (injected) return;
        injected = true;

        if (!window.Lampa) {
            setTimeout(init, 500);
            return;
        }

        injectStyle();
        bindSettingsOpen();
        addSettingsMenu();
        observeCards();

        try {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    addSettingsMenu();
                    addButtonToCard();
                }
            });
        } catch (e) {}

        log('loaded');
    }

    if (window.appready) init();
    else {
        var timer = setInterval(function () {
            if (window.Lampa) {
                clearInterval(timer);
                init();
            }
        }, 500);
    }
})();
