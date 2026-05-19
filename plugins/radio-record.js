/*
 * name: Radio Record
 * author: shardice
 * version: 1.0.0
 * description: Добавляет пункт Радио в левое меню Lampa и мини-плеер для станций Radio Record.
 */

(function () {
    'use strict';

    var COMPONENT = 'home_radio_record';
    var STATIONS_URL = 'https://lampaplugins.github.io/store/stations.json';

    function addCss() {
        if ($('#home-radio-record-style').length) return;

        $('body').append('<style id="home-radio-record-style">' +
            '.home-radio-record-item{margin-left:1em;margin-bottom:1em;width:12.5%;flex-shrink:0;}' +
            '.home-radio-record-item__imgbox{background-color:#3e3e3e;padding-bottom:83%;position:relative;border-radius:.3em;overflow:hidden;}' +
            '.home-radio-record-item__img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;}' +
            '.home-radio-record-item__name{font-size:1.1em;margin-top:.8em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-item.focus .home-radio-record-item__imgbox:after{border:solid .26em #fff;content:"";display:block;position:absolute;left:-.5em;top:-.5em;right:-.5em;bottom:-.5em;border-radius:.8em;}' +
            '@keyframes home-radio-record-sound{0%{height:.1em}100%{height:1em}}' +
            '@keyframes home-radio-record-loading{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}' +
            '.home-radio-record-player{display:flex;align-items:center;border-radius:.3em;padding:.2em .8em;background-color:#3e3e3e;}' +
            '.home-radio-record-player__name{margin-right:1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:8em;}' +
            '.home-radio-record-player__button{position:relative;width:1.5em;height:1.5em;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
            '.home-radio-record-player__button i{display:block;width:.2em;background-color:#fff;margin:0 .1em;animation:home-radio-record-sound 0ms -800ms linear infinite alternate;flex-shrink:0;}' +
            '.home-radio-record-player__button i:nth-child(1){animation-duration:474ms;}' +
            '.home-radio-record-player__button i:nth-child(2){animation-duration:433ms;}' +
            '.home-radio-record-player__button i:nth-child(3){animation-duration:407ms;}' +
            '.home-radio-record-player__button i:nth-child(4){animation-duration:458ms;}' +
            '.home-radio-record-player.stop .home-radio-record-player__button{border-radius:100%;border:.2em solid #fff;}' +
            '.home-radio-record-player.stop .home-radio-record-player__button i{display:none;}' +
            '.home-radio-record-player.stop .home-radio-record-player__button:after{content:"";width:.5em;height:.5em;background-color:#fff;}' +
            '.home-radio-record-player.loading .home-radio-record-player__button:before{content:"";display:block;border-top:.2em solid #fff;border-left:.2em solid transparent;border-right:.2em solid transparent;border-bottom:.2em solid transparent;animation:home-radio-record-loading 1s linear infinite;width:.9em;height:.9em;border-radius:100%;flex-shrink:0;}' +
            '.home-radio-record-player.loading .home-radio-record-player__button i{display:none;}' +
            '.home-radio-record-player.focus{background-color:#fff;color:#000;}' +
            '.home-radio-record-player.focus .home-radio-record-player__button{border-color:#000;}' +
            '.home-radio-record-player.focus .home-radio-record-player__button i,.home-radio-record-player.focus .home-radio-record-player__button:after{background-color:#000;}' +
            '.home-radio-record-player.focus .home-radio-record-player__button:before{border-top-color:#000;}' +
            '@media screen and (max-width:580px){.home-radio-record-item{width:20%;}}' +
            '@media screen and (max-width:385px){.home-radio-record-player__name,.home-radio-record-item__name{display:none}.home-radio-record-item{width:25%;}}' +
        '</style>');
    }

    function radioIcon() {
        return '<svg width="38" height="31" viewBox="0 0 38 31" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="17.613" width="3" height="16.3327" rx="1.5" transform="rotate(63.4707 17.613 0)" fill="white"/>' +
            '<circle cx="13" cy="19" r="6" fill="white"/>' +
            '<path fill-rule="evenodd" clip-rule="evenodd" d="M0 11C0 8.79086 1.79083 7 4 7H34C36.2091 7 38 8.79086 38 11V27C38 29.2091 36.2092 31 34 31H4C1.79083 31 0 29.2091 0 27V11ZM21 19C21 23.4183 17.4183 27 13 27C8.58173 27 5 23.4183 5 19C5 14.5817 8.58173 11 13 11C17.4183 11 21 14.5817 21 19ZM30.5 18C31.8807 18 33 16.8807 33 15.5C33 14.1193 31.8807 13 30.5 13C29.1193 13 28 14.1193 28 15.5C28 16.8807 29.1193 18 30.5 18Z" fill="white"/>' +
        '</svg>';
    }

    function StationItem(data) {
        var html = Lampa.Template.get('home_radio_record_item', {
            name: data.title || 'Radio Record'
        });
        var img = html.find('img')[0];

        img.onerror = function () {
            img.src = './img/img_broken.svg';
        };
        img.src = data.icon_gray || data.icon || '';

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            img.onerror = function () {};
            img.onload = function () {};
            img.src = '';
            html.remove();
        };
    }

    function RadioPlayer() {
        var html = Lampa.Template.get('home_radio_record_player', {});
        var audio = new Audio();
        var url = '';
        var played = false;
        var hls = false;
        var created = false;

        audio.addEventListener('play', function () {
            played = true;
            html.toggleClass('loading', false);
        });

        audio.addEventListener('error', function () {
            html.toggleClass('loading', false);
            if (Lampa.Noty) Lampa.Noty.show('Ошибка в загрузке потока');
        });

        function chooseUrl(data) {
            if (data.stream_320) return data.stream_320;
            if (data.stream_128) return data.stream_128;
            if (data.stream_hls) return data.stream_hls.replace('playlist.m3u8', '96/playlist.m3u8');
            return '';
        }

        function start() {
            var promise;

            try {
                promise = audio.play();
            } catch (e) {}

            if (promise && promise.then) {
                promise.then(function () {
                    console.log('Radio Record', 'start playing');
                })["catch"](function (e) {
                    console.log('Radio Record', 'play promise error:', e && e.message);
                    html.toggleClass('loading', false);
                });
            }
        }

        function loadNative() {
            audio.src = url;
            audio.load();
            start();
        }

        function prepare() {
            var canNativeHls = audio.canPlayType && audio.canPlayType('audio/vnd.apple.mpegurl');
            var canHlsJs = typeof Hls !== 'undefined' && Hls && typeof Hls.isSupported === 'function' && Hls.isSupported();

            if (canNativeHls || url.indexOf('.aacp') > 0 || !canHlsJs) {
                loadNative();
                return;
            }

            try {
                hls = new Hls();
                hls.attachMedia(audio);
                hls.loadSource(url);
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
                        Lampa.Noty.show('Ошибка в загрузке потока');
                    }
                });
                hls.on(Hls.Events.MANIFEST_LOADED, start);
            } catch (e) {
                Lampa.Noty.show('Ошибка в загрузке потока');
            }
        }

        function play() {
            if (!url) return;
            html.toggleClass('loading', true);
            html.toggleClass('stop', false);
            prepare();
        }

        function stop() {
            played = false;
            html.toggleClass('stop', true);
            html.toggleClass('loading', false);

            if (hls) {
                try {
                    hls.destroy();
                } catch (e) {}
                hls = false;
            }

            try {
                audio.pause();
            } catch (e2) {}
            audio.src = '';
        }

        html.on('hover:enter', function () {
            if (played) stop();
            else if (url) play();
        });

        this.create = function () {
            if (created || $('.home-radio-record-player').length) return;
            created = true;

            var head = $('.head__actions').first();
            var search = head.find('.open--search').first();

            if (search.length) search.before(html);
            else if (head.length) head.prepend(html);
        };

        this.play = function (data) {
            stop();
            url = chooseUrl(data || {});

            if (!url) {
                if (Lampa.Noty) Lampa.Noty.show('У станции нет ссылки на поток');
                return;
            }

            html.find('.home-radio-record-player__name').text(data.title || 'Radio Record');
            html.toggleClass('hide', false);
            play();
        };
    }

    function RadioComponent() {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true,
            step: 250
        });
        var player = window.home_radio_record_player;
        var items = [];
        var html = $('<div></div>');
        var body = $('<div class="category-full"></div>');
        var active;
        var last;

        this.create = function () {
            var that = this;

            this.activity.loader(true);
            network["native"](STATIONS_URL, this.build.bind(this), function () {
                var empty = new Lampa.Empty();
                html.append(empty.render());
                that.start = empty.start;
                that.activity.loader(false);
                that.activity.toggle();
            });

            return this.render();
        };

        this.build = function (data) {
            var stations = [];

            try {
                stations = (data.result && data.result.stations ? data.result.stations : []).sort(function (a, b) {
                    return (a.sort || 0) - (b.sort || 0);
                });
            } catch (e) {}

            scroll.minus();
            this.append(stations);
            scroll.append(body);
            html.append(scroll.render());
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.append = function (stations) {
            stations.forEach(function (station) {
                var stationItem = new StationItem(station);

                stationItem.render().on('hover:focus', function () {
                    last = stationItem.render()[0];
                    active = items.indexOf(stationItem);
                    scroll.update(items[active].render(), true);
                }).on('hover:enter', function () {
                    player.play(station);
                });

                body.append(stationItem.render());
                items.push(stationItem);
            });
        };

        this.back = function () {
            Lampa.Activity.backward();
        };

        this.background = function () {
            Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC');
        };

        this.start = function () {
            if (Lampa.Activity.active().activity !== this.activity) return;

            this.background();
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            network.clear();
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            html.remove();
            items = null;
            network = null;
        };
    }

    function addMenuButton() {
        if ($('.menu__item[data-action="' + COMPONENT + '"]').length) return;

        var list = $('.menu .menu__list').eq(0);
        if (!list.length) return;

        var button = $('<li class="menu__item selector" data-action="' + COMPONENT + '">' +
            '<div class="menu__ico">' + radioIcon() + '</div>' +
            '<div class="menu__text">Радио</div>' +
        '</li>');

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Радио Record',
                component: COMPONENT,
                page: 1
            });
        });

        list.append(button);
    }

    function startPlugin() {
        window.home_radio_record = true;

        Lampa.Component.add(COMPONENT, RadioComponent);

        Lampa.Template.add('home_radio_record_item', '<div class="selector home-radio-record-item">' +
            '<div class="home-radio-record-item__imgbox">' +
                '<img class="home-radio-record-item__img" />' +
            '</div>' +
            '<div class="home-radio-record-item__name">{name}</div>' +
        '</div>');

        Lampa.Template.add('home_radio_record_player', '<div class="selector home-radio-record-player stop hide">' +
            '<div class="home-radio-record-player__name">Radio Record</div>' +
            '<div class="home-radio-record-player__button">' +
                '<i></i><i></i><i></i><i></i>' +
            '</div>' +
        '</div>');

        addCss();
        window.home_radio_record_player = window.home_radio_record_player || new RadioPlayer();

        function ready() {
            addCss();
            addMenuButton();
            window.home_radio_record_player.create();
        }

        if (window.appready) ready();

        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') ready();
        });

        Lampa.Listener.follow('menu', function (e) {
            if (e.type === 'start' || e.type === 'end') setTimeout(addMenuButton, 100);
        });
    }

    if (!window.home_radio_record) startPlugin();
})();
