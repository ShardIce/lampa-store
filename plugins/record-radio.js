/*
 * name: Radio Record
 * author: shardice
 * version: 2.1.0
 * description: Лёгкий Radio Record без постоянного сканирования интерфейса.
 */
(function () {
    'use strict';
    var audio = null;
    function stations() {
        return [
            { title: 'Record', url: 'https://radiorecord.hostingradio.ru/rr_main96.aacp' },
            { title: 'Russian Hits', url: 'https://radiorecord.hostingradio.ru/russianhits96.aacp' },
            { title: 'Big Hits', url: 'https://radiorecord.hostingradio.ru/bighits96.aacp' },
            { title: 'Chill-Out', url: 'https://radiorecord.hostingradio.ru/chil96.aacp' },
            { title: 'Deep', url: 'https://radiorecord.hostingradio.ru/deep96.aacp' }
        ];
    }
    function play(item) {
        try {
            if (audio) { audio.pause(); audio.src = ''; }
            audio = new Audio(item.url);
            audio.play();
            if (Lampa.Noty) Lampa.Noty.show('Играет: ' + item.title);
        } catch (e) { if (Lampa.Noty) Lampa.Noty.show('Не удалось включить радио'); }
    }
    window.PluginHomeRadioRecord = function () {
        Lampa.Select.show({title: 'Radio Record', items: stations(), onSelect: play});
    };
    if (window.appready && Lampa.Noty) Lampa.Noty.show('Radio Record установлен');
})();
