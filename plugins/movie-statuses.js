/*
 * name: Статусы фильмов и сериалов
 * version: 1.0.0
 * author: shardice
 * description: Локальные пользовательские статусы для карточек Lampa
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'shardice_movie_statuses_v1';
    var COMPONENT = 'shardice_movie_statuses';
    var CURRENT_CARD = null;

    var STATUSES = [
        { id: 'watching', title: 'Смотрю', icon: '▶' },
        { id: 'planned', title: 'Буду смотреть', icon: '＋' },
        { id: 'watched', title: 'Просмотрено', icon: '✓' },
        { id: 'paused', title: 'Отложено', icon: '⏸' },
        { id: 'dropped', title: 'Брошено', icon: '×' }
    ];

    Lampa.Lang.add({
        shardice_statuses_settings: { ru: 'Мои статусы', en: 'My statuses', uk: 'Мої статуси' },
        shardice_statuses_descr: { ru: 'Личные списки фильмов и сериалов', en: 'Personal movie and TV lists', uk: 'Особисті списки фільмів і серіалів' },
        shardice_status_button: { ru: 'Статус', en: 'Status', uk: 'Статус' },
        shardice_status_empty: { ru: 'Пока нет сохранённых статусов', en: 'No saved statuses yet', uk: 'Поки немає збережених статусів' }
    });

    function notify(text) {
        if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(text);
        else console.log(text);
    }

    function load() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
        catch (e) { return {}; }
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function cardId(card) {
        if (!card) return '';
        var type = card.media_type || card.type || card.original_type || 'movie';
        var id = card.id || card.tmdb_id || card.kinopoisk_id || card.imdb_id || card.title || card.name;
        return type + '_' + id;
    }

    function cardTitle(card) {
        return (card && (card.title || card.name || card.original_title || card.original_name)) || 'Без названия';
    }

    function poster(card) {
        if (!card) return '';
        if (card.poster_path && Lampa.Api && Lampa.Api.img) return Lampa.Api.img(card.poster_path, 'w185');
        return card.poster || card.img || card.picture || '';
    }

    function setStatus(card, statusId) {
        var id = cardId(card);
        if (!id) return notify('Не удалось определить карточку');

        var data = load();
        var status = STATUSES.filter(function (s) { return s.id === statusId; })[0];

        data[id] = {
            id: id,
            status: statusId,
            title: cardTitle(card),
            year: card.release_date ? String(card.release_date).slice(0, 4) : (card.first_air_date ? String(card.first_air_date).slice(0, 4) : (card.year || '')),
            type: card.media_type || card.type || 'movie',
            poster: poster(card),
            tmdb_id: card.id || '',
            updated_at: Date.now()
        };

        save(data);
        notify('Статус: ' + (status ? status.title : statusId));
    }

    function removeStatus(card) {
        var id = cardId(card);
        var data = load();
        delete data[id];
        save(data);
        notify('Статус удалён');
    }

    function showStatusSelect(card) {
        var items = STATUSES.map(function (s) {
            return { title: s.icon + '  ' + s.title, status: s.id };
        });

        items.push({ title: '— Удалить статус', status: 'remove' });

        Lampa.Select.show({
            title: 'Выбрать статус',
            items: items,
            onSelect: function (item) {
                if (item.status === 'remove') removeStatus(card);
                else setStatus(card, item.status);
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    function showSaved(statusId) {
        var data = load();
        var list = Object.keys(data).map(function (k) { return data[k]; }).filter(function (item) {
            return !statusId || item.status === statusId;
        }).sort(function (a, b) { return (b.updated_at || 0) - (a.updated_at || 0); });

        if (!list.length) {
            notify(Lampa.Lang.translate('shardice_status_empty'));
            return;
        }

        Lampa.Select.show({
            title: statusId ? (STATUSES.filter(function (s) { return s.id === statusId; })[0] || {}).title : 'Мои статусы',
            items: list.map(function (item) {
                return {
                    title: item.title + (item.year ? ' (' + item.year + ')' : ''),
                    subtitle: (STATUSES.filter(function (s) { return s.id === item.status; })[0] || {}).title || item.status,
                    item: item
                };
            }),
            onSelect: function (selected) {
                notify(selected.item.title);
            },
            onBack: function () {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    function showRoot() {
        var items = [{ title: 'Все сохранённые', status: null }].concat(STATUSES.map(function (s) {
            return { title: s.icon + '  ' + s.title, status: s.id };
        }));

        Lampa.Select.show({
            title: 'Мои статусы',
            items: items,
            onSelect: function (item) { showSaved(item.status); },
            onBack: function () { Lampa.Controller.toggle('settings_component'); }
        });
    }

    function injectSettings() {
        try {
            if (!Lampa.Settings || !Lampa.Settings.main) return;

            var main = Lampa.Settings.main();
            var render = main.render();
            if (render.find('[data-component="' + COMPONENT + '"]').length) return;

            var html = '' +
                '<div class="settings-param selector" data-component="' + COMPONENT + '">' +
                    '<div class="settings-param__name">' + Lampa.Lang.translate('shardice_statuses_settings') + '</div>' +
                    '<div class="settings-param__descr">' + Lampa.Lang.translate('shardice_statuses_descr') + '</div>' +
                '</div>';

            var after = render.find('[data-component="shardice_clean_store"]');
            if (!after.length) after = render.find('[data-component="more"]');
            if (after.length) after.after(html);
            else render.append(html);

            main.update();
        } catch (e) {
            console.log('Movie Statuses settings error:', e);
        }
    }

    function getActiveCard() {
        try {
            var active = Lampa.Activity.active();
            if (active && active.card) return active.card;
            if (active && active.movie) return active.movie;
            if (active && active.data) return active.data;
        } catch (e) {}
        return CURRENT_CARD;
    }

    function injectButton() {
        try {
            var active = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
            if (active && (active.card || active.movie || active.data)) CURRENT_CARD = active.card || active.movie || active.data;

            var buttons = $('.full-start__buttons, .full-descr__buttons, .full-start-new__buttons').first();
            if (!buttons.length || buttons.find('[data-action="shardice-status"]').length) return;

            var button = $('<div class="full-start__button selector" data-action="shardice-status"><span>☑</span><div>' + Lampa.Lang.translate('shardice_status_button') + '</div></div>');
            buttons.append(button);
        } catch (e) {}
    }

    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name === 'main') {
            e.body.find('[data-component="' + COMPONENT + '"]').off('hover:enter click').on('hover:enter click', function () {
                showRoot();
            });
        }
    });

    $(document).on('hover:enter click', '[data-action="shardice-status"]', function () {
        showStatusSelect(getActiveCard());
    });

    if (Lampa.Activity && Lampa.Activity.listener) {
        Lampa.Activity.listener.follow('activity', function () {
            setTimeout(injectButton, 300);
            setTimeout(injectButton, 1000);
        });
    }

    if (window.appready) {
        injectSettings();
        setInterval(injectButton, 1500);
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                injectSettings();
                setInterval(injectButton, 1500);
            }
        });
    }
})();
