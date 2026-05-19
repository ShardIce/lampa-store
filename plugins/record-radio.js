/*
 * name: Radio Record
 * author: shardice
 * version: 1.3.0
 * description: Простое Radio Record меню
 */

(function () {
    'use strict';

    var COMPONENT = 'record_radio_plugin_menu';
    var inserted = false;

    function css() {
        if ($('#record-radio-plugin-style').length) return;

        $('body').append('<style id="record-radio-plugin-style">' +
            '.record-radio-menu-item{display:flex!important;align-items:center!important;gap:.9em!important;padding:.55em .9em!important;border-radius:.9em!important;margin:.12em 0!important;}' +
            '.record-radio-menu-icon{width:2em!important;height:2em!important;border-radius:.55em!important;background:linear-gradient(135deg,#ff4757,#ff9f1a)!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#fff!important;font-weight:900!important;font-size:.78em!important;flex:0 0 2em!important;}' +
            '.record-radio-menu-text{font-size:1.03em!important;font-weight:800!important;}' +
            '.record-radio-menu-item.focus,.record-radio-menu-item.hover{background:rgba(255,255,255,.13)!important;}' +
        '</style>');
    }

    function open() {
        Lampa.Select.show({
            title: 'Radio Record',
            items: [
                { title: 'Record', stream: 'https://radiorecord.hostingradio.ru/rr_main96.aacp' },
                { title: 'Russian Hits', stream: 'https://radiorecord.hostingradio.ru/russianhits96.aacp' },
                { title: 'Big Hits', stream: 'https://radiorecord.hostingradio.ru/bighits96.aacp' },
                { title: 'Chill-Out', stream: 'https://radiorecord.hostingradio.ru/chil96.aacp' },
                { title: 'Deep', stream: 'https://radiorecord.hostingradio.ru/deep96.aacp' }
            ],
            onSelect: function (item) {
                try {
                    if (window.RecordRadioAudio) {
                        window.RecordRadioAudio.pause();
                        window.RecordRadioAudio.src = '';
                    }

                    window.RecordRadioAudio = new Audio(item.stream);
                    window.RecordRadioAudio.play();

                    if (Lampa.Noty) Lampa.Noty.show('Играет: ' + item.title);
                } catch (e) {
                    if (Lampa.Noty) Lampa.Noty.show('Не удалось включить радио');
                }
            }
        });
    }

    function item() {
        var el = $('<div class="record-radio-menu-item selector" data-component="' + COMPONENT + '">' +
            '<div class="record-radio-menu-icon">REC</div>' +
            '<div class="record-radio-menu-text">Radio Record</div>' +
        '</div>');

        el.on('hover:enter click', open);

        return el;
    }

    function findMenu() {
        var settings = $('.selector, [data-component], [data-action], div').filter(function () {
            return ($(this).text() || '').trim() == 'Настройки';
        }).first();

        if (settings.length) return settings.parent();

        var home = $('.selector, [data-component], [data-action], div').filter(function () {
            return ($(this).text() || '').trim() == 'Главная';
        }).first();

        if (home.length) return home.parent();

        return $();
    }

    function inject() {
        css();

        if ($('[data-component="' + COMPONENT + '"]').length) {
            inserted = true;
            return;
        }

        var menu = findMenu();

        if (!menu.length) return;

        var settings = menu.children().filter(function () {
            return ($(this).text() || '').indexOf('Настройки') > -1;
        }).first();

        if (settings.length) settings.before(item());
        else menu.append(item());

        inserted = true;
    }

    function boot() {
        inject();
        setInterval(inject, 1500);

        if (Lampa.Noty) Lampa.Noty.show('Radio Record установлен');
    }

    if (window.appready) boot();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') boot();
        });
    }
})();
