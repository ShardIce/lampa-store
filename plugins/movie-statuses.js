/*
 * name: Статусы фильмов
 * author: shardice
 * version: 1.0.6
 * description: Локальные статусы для фильмов и сериалов в Lampa
 */

(function () {
    'use strict';

    var STORAGE_KEY = 'plugin_home_movie_statuses_v1';

    var STATUSES = [
        { id: 'watching', title: 'Смотрю' },
        { id: 'planned', title: 'Буду смотреть' },
        { id: 'watched', title: 'Просмотрено' },
        { id: 'paused', title: 'Отложено' },
        { id: 'dropped', title: 'Брошено' }
    ];

    Lampa.Lang.add({
        plugin_home_status_button: { ru: 'Статус', en: 'Status', uk: 'Статус' },
        plugin_home_statuses_menu: { ru: 'Мои статусы', en: 'My statuses', uk: 'Мої статуси' }
    });

    function all() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
        catch (e) { return {}; }
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
    }

    function id(movie) {
        return String(movie && (movie.id || movie.tmdb_id || movie.imdb_id || movie.original_title || movie.name) || '');
    }

    function title(movie) {
        return movie.title || movie.name || movie.original_title || movie.original_name || 'Без названия';
    }

    function setStatus(movie, status) {
        var mid = id(movie);
        if (!mid) return;

        var data = all();

        data[mid] = {
            id: mid,
            status: status.id,
            status_title: status.title,
            title: title(movie),
            year: movie.release_date ? String(movie.release_date).slice(0, 4) : (movie.first_air_date ? String(movie.first_air_date).slice(0, 4) : ''),
            saved_at: Date.now()
        };

        save(data);

        if (Lampa.Noty) Lampa.Noty.show('Статус: ' + status.title);
    }

    function selectStatus(movie) {
        var items = STATUSES.map(function (status) {
            return { title: status.title, subtitle: 'Назначить статус', status: status };
        });

        items.push({ title: 'Убрать статус', subtitle: 'Удалить фильм из моих статусов', remove: true });

        Lampa.Select.show({
            title: 'Статус',
            items: items,
            onSelect: function (item) {
                var data = all();
                var mid = id(movie);

                if (item.remove) {
                    if (mid && data[mid]) {
                        delete data[mid];
                        save(data);
                    }
                    if (Lampa.Noty) Lampa.Noty.show('Статус удалён');
                } else {
                    setStatus(movie, item.status);
                }
            }
        });
    }

    function addFullButton(e) {
        try {
            var movie = e.data && e.data.movie ? e.data.movie : e.data;
            if (!movie) return;

            var body = $('.full-start__buttons, .full-start-new__buttons, .full-start__buttons-container').first();
            if (!body.length) return;
            if (body.find('[data-plugin-home-status-button]').length) return;

            var button = $('<div class="full-start__button selector" data-plugin-home-status-button="1"><span>' + Lampa.Lang.translate('plugin_home_status_button') + '</span></div>');

            button.on('hover:enter', function () {
                selectStatus(movie);
            });

            body.append(button);
        } catch (err) {
            console.log('Plugin Home Statuses error:', err);
        }
    }

    function addSettings() {
        if (!Lampa.Settings || !Lampa.Settings.main) return;

        var settings = Lampa.Settings.main();
        var render = settings.render();

        if (render.find('[data-component="plugin_home_statuses"]').length) return;

        var field = $('<div class="settings-param selector" data-component="plugin_home_statuses">' +
            '<div class="settings-param__name">' + Lampa.Lang.translate('plugin_home_statuses_menu') + '</div>' +
            '<div class="settings-param__descr">Список фильмов и сериалов с вашими статусами</div>' +
        '</div>');

        var after = render.find('[data-component="plugin_home_store"], [data-component="more"]').first();
        if (after.length) after.after(field);
        else render.append(field);

        settings.update();
    }

    function openList() {
        var data = all();

        var items = Object.keys(data).map(function (key) {
            var item = data[key];
            return { title: item.title, subtitle: item.status_title + (item.year ? ' • ' + item.year : '') };
        });

        if (!items.length) {
            items.push({ title: 'Пока пусто', subtitle: 'Откройте фильм и нажмите кнопку «Статус»' });
        }

        Lampa.Select.show({ title: 'Мои статусы', items: items, onSelect: function () {} });
    }

    if (Lampa.Listener) {
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite' || e.type == 'complete') {
                setTimeout(function () { addFullButton(e); }, 300);
            }
        });
    }

    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'main') {
            addSettings();
            e.body.find('[data-component="plugin_home_statuses"]').off('hover:enter').on('hover:enter', openList);
        }
    });

    if (window.appready) addSettings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addSettings();
        });
    }
})();
