/*
 * name: Radio Record
 * author: shardice
 * version: 1.1.2
 * description: Добавляет пункт Радио в левое меню Lampa, полный список каналов Radio Record и мини-плеер.
 */

(function () {
    'use strict';

    var COMPONENT = 'home_radio_record';
    var STATIONS_URL = 'https://www.radiorecord.ru/api/stations/';
    var KEY_NAMESPACE = 'keydown.home_radio_record';

    function addCss() {
        if ($('#home-radio-record-style').length) return;

        $('body').append('<style id="home-radio-record-style">' +
            '.home-radio-record-item{margin-left:1em;margin-bottom:1em;width:12.5%;flex-shrink:0;padding:.22em;border-radius:.36em;transition:background-color .12s ease;}' +
            '.home-radio-record-item__imgbox{background-color:rgba(255,255,255,.035);padding-bottom:83%;position:relative;border:.08em solid rgba(255,255,255,.08);border-radius:.18em;overflow:hidden;box-sizing:border-box;transition:border-color .12s ease,box-shadow .12s ease,background-color .12s ease;}' +
            '.home-radio-record-item__img{position:absolute;top:12%;left:12%;width:76%;height:76%;object-fit:contain;filter:brightness(0) invert(1);opacity:.82;transition:opacity .12s ease;}' +
            '.home-radio-record-item__name{font-size:1.02em;margin-top:.7em;color:rgba(255,255,255,.72);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-item.focus,.home-radio-record-item.hover{background-color:rgba(255,255,255,.045);}' +
            '.home-radio-record-item.focus .home-radio-record-item__imgbox,.home-radio-record-item.hover .home-radio-record-item__imgbox{border-color:rgba(255,255,255,.95);box-shadow:0 0 0 .08em rgba(255,255,255,.32),inset 0 0 0 .06em rgba(255,255,255,.12);background-color:rgba(255,255,255,.06);}' +
            '.home-radio-record-item.focus .home-radio-record-item__img,.home-radio-record-item.hover .home-radio-record-item__img{opacity:1;}' +
            '.home-radio-record-item.playing .home-radio-record-item__imgbox{border-color:rgba(255,255,255,.36);background-color:rgba(255,255,255,.055);}' +
            '.home-radio-record-item.playing .home-radio-record-item__name{color:rgba(255,255,255,.92);}' +
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

    function cleanUrl(url) {
        return (url || '').replace('http://localhost:6081', '');
    }

    function normalizeStation(station, index) {
        var normalized = {};
        var key;

        for (key in station) {
            if (Object.prototype.hasOwnProperty.call(station, key)) normalized[key] = station[key];
        }

        normalized.sort = parseInt(normalized.sort, 10);
        if (isNaN(normalized.sort)) normalized.sort = index;

        normalized.title = normalized.title || normalized.short_title || 'Radio Record';
        normalized.icon_gray = cleanUrl(normalized.icon_gray);
        normalized.icon_fill_colored = cleanUrl(normalized.icon_fill_colored);
        normalized.icon_fill_white = cleanUrl(normalized.icon_fill_white);
        normalized.icon = normalized.icon_gray || normalized.icon_fill_white || normalized.icon_fill_colored || cleanUrl(normalized.icon);
        normalized.stream_64 = cleanUrl(normalized.stream_64);
        normalized.stream_128 = cleanUrl(normalized.stream_128);
        normalized.stream_320 = cleanUrl(normalized.stream_320);
        normalized.stream_hls = cleanUrl(normalized.stream_hls);
        normalized._index = index;

        return normalized;
    }

    function parseStations(data) {
        var source = [];

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = {};
            }
        }

        try {
            if (data.result && Array.isArray(data.result.stations)) source = data.result.stations;
            else if (Array.isArray(data.stations)) source = data.stations;
        } catch (e2) {}

        return source.filter(function (station) {
            return station;
        }).map(normalizeStation).filter(function (station) {
            return station.stream_320 || station.stream_128 || station.stream_hls;
        }).sort(function (a, b) {
            if (a.sort === b.sort) return a._index - b._index;
            return a.sort - b.sort;
        });
    }

    function StationItem(data) {
        var html = Lampa.Template.get('home_radio_record_item', {
            name: data.title || 'Radio Record'
        });
        var img = html.find('img')[0];

        html.attr('title', data.title || 'Radio Record');
        if (data.prefix) html.attr('data-prefix', data.prefix);

        img.onerror = function () {
            img.src = './img/img_broken.svg';
        };
        img.src = data.icon_gray || data.icon || data.icon_fill_white || data.icon_fill_colored || '';

        this.data = data;

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

        html.on('hover:enter click', function (e) {
            if (e && e.preventDefault) e.preventDefault();
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
        var activity;
        var active;
        var last;
        var playing = '';
        var keyBound = false;

        function stopEvent(e) {
            if (!e) return;
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            e.cancelBubble = true;
            e.returnValue = false;
        }

        function isActiveActivity() {
            try {
                return Lampa.Activity.active().activity === activity;
            } catch (e) {
                return false;
            }
        }

        function setFocus(index) {
            var item;
            var itemHtml;

            if (!items || !items.length) return false;

            if (index < 0) index = 0;
            if (index >= items.length) index = items.length - 1;

            active = index;
            item = items[active];
            itemHtml = item.render();
            last = itemHtml[0];

            body.find('.selector').removeClass('focus hover');
            itemHtml.addClass('focus');
            scroll.update(itemHtml, true);

            try {
                Lampa.Controller.collectionFocus(itemHtml, scroll.render());
            } catch (e) {}

            return true;
        }

        function findMoveIndex(direction) {
            var current;
            var rect;
            var centerX;
            var centerY;
            var best = -1;
            var bestScore = Infinity;

            if (typeof active !== 'number') return 0;
            current = items[active] && items[active].render()[0];
            if (!current) return -1;

            rect = current.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;

            items.forEach(function (item, index) {
                var element;
                var itemRect;
                var itemX;
                var itemY;
                var primary = 0;
                var secondary = 0;
                var score;

                if (index === active) return;

                element = item.render()[0];
                if (!element) return;

                itemRect = element.getBoundingClientRect();
                itemX = itemRect.left + itemRect.width / 2;
                itemY = itemRect.top + itemRect.height / 2;

                if (direction === 'left') {
                    primary = centerX - itemX;
                    secondary = Math.abs(centerY - itemY);
                } else if (direction === 'right') {
                    primary = itemX - centerX;
                    secondary = Math.abs(centerY - itemY);
                } else if (direction === 'up') {
                    primary = centerY - itemY;
                    secondary = Math.abs(centerX - itemX);
                } else if (direction === 'down') {
                    primary = itemY - centerY;
                    secondary = Math.abs(centerX - itemX);
                }

                if (primary <= 4) return;

                score = primary * 1000 + secondary;
                if (score < bestScore) {
                    bestScore = score;
                    best = index;
                }
            });

            return best;
        }

        function moveFocus(direction) {
            var next;

            if (!items || !items.length) return false;
            if (typeof active !== 'number') return setFocus(0);

            next = findMoveIndex(direction);
            if (next > -1) return setFocus(next);

            return false;
        }

        function playFocused() {
            var item;

            if (typeof active !== 'number') active = 0;
            item = items[active];

            if (item && item.data) {
                markPlaying(item.data);
                player.play(item.data);
                return true;
            }

            return false;
        }

        function stationKey(station) {
            return station && (station.prefix || station.id || station.title) || '';
        }

        function markPlaying(station) {
            playing = stationKey(station);

            items.forEach(function (item) {
                item.render().toggleClass('playing', stationKey(item.data) === playing);
            });
        }

        function leaveContent(target) {
            unbindKeys();
            if (Lampa.Controller) Lampa.Controller.toggle(target);
        }

        function moveOrLeave(direction) {
            if (moveFocus(direction)) return;
            if (direction === 'left') leaveContent('menu');
            else if (direction === 'up') leaveContent('head');
        }

        function bindKeys() {
            if (keyBound) return;
            keyBound = true;

            $(document).on(KEY_NAMESPACE, function (e) {
                var code;

                if (!isActiveActivity()) return;

                code = e.keyCode || e.which;

                if (code === 37 || code === 21) {
                    stopEvent(e);
                    moveOrLeave('left');
                    return false;
                }

                if (code === 39 || code === 22) {
                    stopEvent(e);
                    moveOrLeave('right');
                    return false;
                }

                if (code === 38 || code === 19) {
                    stopEvent(e);
                    moveOrLeave('up');
                    return false;
                }

                if (code === 40 || code === 20) {
                    stopEvent(e);
                    moveOrLeave('down');
                    return false;
                }

                if (code === 13 || code === 23 || code === 66) {
                    stopEvent(e);
                    playFocused();
                    return false;
                }

                if (code === 4 || code === 8 || code === 27 || code === 461 || code === 10009) {
                    stopEvent(e);
                    unbindKeys();
                    Lampa.Activity.backward();
                    return false;
                }
            });
        }

        function unbindKeys() {
            keyBound = false;
            $(document).off(KEY_NAMESPACE);
        }

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
            var stations = parseStations(data);

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
                    setFocus(items.indexOf(stationItem));
                }).on('hover:enter click', function (e) {
                    if (e && e.preventDefault) e.preventDefault();
                    setFocus(items.indexOf(stationItem));
                    markPlaying(station);
                    player.play(station);
                });

                body.append(stationItem.render());
                items.push(stationItem);
            });

            if (items.length && typeof active !== 'number') {
                active = 0;
                last = items[0].render()[0];
                items[0].render().addClass('focus');
            }
        };

        this.back = function () {
            unbindKeys();
            Lampa.Activity.backward();
        };

        this.background = function () {
            Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC');
        };

        this.start = function () {
            if (Lampa.Activity.active().activity !== this.activity) return;

            activity = this.activity;
            this.background();
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    bindKeys();
                    if (items && items.length) setFocus(typeof active === 'number' ? active : 0);
                    else Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                left: function () {
                    moveOrLeave('left');
                },
                right: function () {
                    moveOrLeave('right');
                },
                up: function () {
                    moveOrLeave('up');
                },
                down: function () {
                    moveOrLeave('down');
                },
                enter: playFocused,
                ok: playFocused,
                select: playFocused,
                back: this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = unbindKeys;
        this.stop = unbindKeys;

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            unbindKeys();
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
