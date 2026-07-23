/*
 * name: Radio Record
 * author: shardice
 * version: 1.1.5
 * description: Добавляет пункт Радио в левое меню Lampa, полный список каналов Radio Record и мини-плеер.
 */

(function () {
    'use strict';

    var COMPONENT = 'home_radio_record';
    var STATIONS_URL = 'https://www.radiorecord.ru/api/stations/';
    var NOW_URL = 'https://www.radiorecord.ru/api/stations/now/';
    var KEY_NAMESPACE = 'keydown.home_radio_record';
    var NAVIGATION_DELAY = 35;
    var STREAM_START_TIMEOUT = 8000;
    var TRACK_POLL_INTERVAL = 25000;
    var ICON_PRELOAD_CHUNK = 10;
    var ICON_PRELOAD_DELAY = 140;

    function addCss() {
        if ($('#home-radio-record-style').length) return;

        $('body').append('<style id="home-radio-record-style">' +
            '.home-radio-record-panel{display:flex;align-items:center;margin:0 1em 1.15em 1em;min-height:5.35em;padding:.7em .85em;border-radius:.34em;background:linear-gradient(90deg,rgba(246,73,0,.18),rgba(38,38,38,.96) 28%,rgba(28,28,28,.96));box-shadow:inset 0 0 0 .08em rgba(255,255,255,.07);box-sizing:border-box;}' +
            '.home-radio-record-panel__cover{width:4.15em;height:4.15em;border-radius:.3em;background-color:rgba(0,0,0,.24);box-shadow:inset 0 0 0 .08em rgba(255,255,255,.08);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;}' +
            '.home-radio-record-panel__cover img{width:100%;height:100%;object-fit:cover;opacity:.96;}' +
            '.home-radio-record-panel__cover.is-icon img{width:68%;height:68%;object-fit:contain;opacity:.78;}' +
            '.home-radio-record-panel__meta{min-width:0;margin-left:1em;flex:1;}' +
            '.home-radio-record-panel__station{font-size:.9em;color:#F64900;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-panel__track{font-size:1.24em;color:#fff;font-weight:700;line-height:1.12;margin-top:.12em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-panel__artist{font-size:.95em;color:rgba(255,255,255,.62);margin-top:.18em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-panel__actions{display:flex;align-items:center;margin-left:.8em;}' +
            '.home-radio-record-panel__btn{width:3.05em;height:3.05em;margin-left:.45em;border-radius:.28em;background-color:rgba(255,255,255,.07);box-shadow:inset 0 0 0 .08em rgba(255,255,255,.09);position:relative;flex-shrink:0;transition:background-color .12s ease,box-shadow .12s ease;}' +
            '.home-radio-record-panel__btn.focus,.home-radio-record-panel__btn.hover{background-color:rgba(246,73,0,.22);box-shadow:0 0 0 .1em rgba(255,255,255,.88),0 .22em .9em rgba(246,73,0,.22);}' +
            '.home-radio-record-panel__toggle:before{content:"";position:absolute;left:50%;top:50%;transform:translate(-37%,-50%);width:0;height:0;border-top:.58em solid transparent;border-bottom:.58em solid transparent;border-left:.88em solid #fff;}' +
            '.home-radio-record-panel.is-playing .home-radio-record-panel__toggle:before,.home-radio-record-panel.is-playing .home-radio-record-panel__toggle:after{content:"";position:absolute;top:32%;width:.28em;height:36%;border:0;background-color:#fff;transform:none;}' +
            '.home-radio-record-panel.is-playing .home-radio-record-panel__toggle:before{left:38%;}' +
            '.home-radio-record-panel.is-playing .home-radio-record-panel__toggle:after{left:55%;}' +
            '.home-radio-record-panel.is-loading .home-radio-record-panel__toggle:before{content:"";left:50%;top:50%;width:1em;height:1em;border:.18em solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:100%;transform:translate(-50%,-50%);animation:home-radio-record-loading .85s linear infinite;}' +
            '.home-radio-record-panel.is-loading .home-radio-record-panel__toggle:after{display:none;}' +
            '.home-radio-record-panel__close:before,.home-radio-record-panel__close:after{content:"";position:absolute;left:32%;top:48%;width:36%;height:.14em;background-color:#fff;border-radius:.1em;}' +
            '.home-radio-record-panel__close:before{transform:rotate(45deg);}' +
            '.home-radio-record-panel__close:after{transform:rotate(-45deg);}' +
            '.home-radio-record-item{margin-left:1em;margin-bottom:1em;width:12.5%;flex-shrink:0;padding:.22em;border-radius:.36em;transition:background-color .12s ease;}' +
            '.home-radio-record-item__imgbox{background-color:rgba(255,255,255,.035);padding-bottom:83%;position:relative;border:.08em solid rgba(255,255,255,.08);border-radius:.18em;overflow:hidden;box-sizing:border-box;transition:border-color .12s ease,box-shadow .12s ease,background-color .12s ease;}' +
            '.home-radio-record-item__img{position:absolute;top:14%;left:14%;width:72%;height:72%;object-fit:contain;opacity:.86;transition:opacity .12s ease;}' +
            '.home-radio-record-item__name{font-size:1.02em;margin-top:.7em;color:rgba(255,255,255,.72);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-item.focus,.home-radio-record-item.hover{background-color:rgba(255,255,255,.045);}' +
            '.home-radio-record-item.focus .home-radio-record-item__imgbox,.home-radio-record-item.hover .home-radio-record-item__imgbox{border-color:rgba(255,255,255,.95);box-shadow:0 0 0 .08em rgba(255,255,255,.32),inset 0 0 0 .06em rgba(255,255,255,.12);background-color:rgba(255,255,255,.06);}' +
            '.home-radio-record-item.focus .home-radio-record-item__img,.home-radio-record-item.hover .home-radio-record-item__img{opacity:1;}' +
            '.home-radio-record-item.playing .home-radio-record-item__imgbox{border-color:#F64900;background-color:rgba(246,73,0,.13);box-shadow:0 0 0 .08em rgba(246,73,0,.5),0 .3em 1em rgba(246,73,0,.2);}' +
            '.home-radio-record-item.playing.focus .home-radio-record-item__imgbox,.home-radio-record-item.playing.hover .home-radio-record-item__imgbox{border-color:#F64900;box-shadow:0 0 0 .1em rgba(255,255,255,.92),0 0 0 .22em rgba(246,73,0,.7),0 .35em 1.15em rgba(246,73,0,.28);}' +
            '.home-radio-record-item.playing .home-radio-record-item__name{color:#fff;}' +
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
            '@media screen and (max-width:580px){.home-radio-record-panel{margin:.2em .7em 1em .7em}.home-radio-record-panel__cover{width:3.55em;height:3.55em}.home-radio-record-panel__track{font-size:1.05em}.home-radio-record-panel__artist{font-size:.85em}.home-radio-record-panel__btn{width:2.65em;height:2.65em}.home-radio-record-item{width:20%;}}' +
            '@media screen and (max-width:385px){.home-radio-record-player__name,.home-radio-record-item__name{display:none}.home-radio-record-panel__artist{display:none}.home-radio-record-panel__cover{width:3.1em;height:3.1em}.home-radio-record-panel__actions{margin-left:.45em}.home-radio-record-panel__btn{width:2.35em;height:2.35em}.home-radio-record-item{width:25%;}}' +
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
        var iconGray = cleanUrl(station.icon_gray);
        var iconWhite = cleanUrl(station.icon_fill_white);
        var iconColored = cleanUrl(station.icon_fill_colored);
        var sort = parseInt(station.sort, 10);

        if (isNaN(sort)) sort = index;

        return {
            id: station.id,
            prefix: station.prefix,
            title: station.title || station.short_title || 'Radio Record',
            sort: sort,
            icon: iconGray || iconWhite || iconColored || cleanUrl(station.icon),
            stream_128: cleanUrl(station.stream_128),
            stream_320: cleanUrl(station.stream_320),
            stream_hls: cleanUrl(station.stream_hls),
            _index: index
        };
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
        var loaded = false;

        html.attr('title', data.title || 'Radio Record');
        if (data.prefix) html.attr('data-prefix', data.prefix);

        img.onerror = function () {
            img.src = './img/img_broken.svg';
        };
        img.loading = 'lazy';
        img.decoding = 'async';

        this.data = data;

        this.load = function () {
            if (loaded) return;
            loaded = true;
            img.loading = 'eager';
            img.src = data.icon || '';
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            img.onerror = function () {};
            img.onload = function () {};
            img.src = '';
            loaded = false;
            html.remove();
        };
    }

    function RadioPlayer() {
        var html = Lampa.Template.get('home_radio_record_player', {});
        var audio = new Audio();
        var url = '';
        var urlCandidates = [];
        var urlIndex = 0;
        var played = false;
        var loading = false;
        var hls = false;
        var created = false;
        var reconnectTimer = false;
        var waitingTimer = false;
        var startTimer = false;
        var trackTimer = false;
        var manualStop = true;
        var currentStation = false;
        var currentTrack = false;
        var stateListeners = [];
        var trackRequest = false;

        try {
            trackRequest = new Lampa.Reguest();
        } catch (e) {}

        audio.preload = 'auto';

        audio.addEventListener('play', function () {
            manualStop = false;
        });

        audio.addEventListener('error', function () {
            scheduleReconnect();
        });

        audio.addEventListener('ended', scheduleReconnect);
        audio.addEventListener('stalled', scheduleReconnect);
        audio.addEventListener('waiting', function () {
            clearTimeout(waitingTimer);
            waitingTimer = setTimeout(function () {
                if (!manualStop && !audio.paused && audio.readyState < 3) scheduleReconnect();
            }, 7000);
        });

        audio.addEventListener('playing', function () {
            played = true;
            loading = false;
            clearTimeout(waitingTimer);
            clearTimeout(startTimer);
            clearReconnect();
            updateControls();
            scheduleTrackPoll(0);
        });

        function currentState() {
            return {
                station: currentStation,
                track: currentTrack,
                played: played,
                loading: loading,
                stopped: manualStop && !loading,
                hasUrl: !!url
            };
        }

        function emitState() {
            var state = currentState();

            stateListeners.slice().forEach(function (listener) {
                try {
                    listener(state);
                } catch (e) {}
            });
        }

        function updateControls() {
            html.toggleClass('loading', loading);
            html.toggleClass('stop', !played && !loading);
            emitState();
        }

        function addCandidate(result, value) {
            value = cleanUrl(value);

            if (value && result.indexOf(value) === -1) result.push(value);
        }

        function streamCandidates(data) {
            var result = [];
            var hlsUrl = data && data.stream_hls;

            addCandidate(result, data && data.stream_128);
            addCandidate(result, data && data.stream_320);

            if (hlsUrl) {
                addCandidate(result, hlsUrl);
                addCandidate(result, hlsUrl.replace('playlist.m3u8', '96/playlist.m3u8'));
            }

            return result;
        }

        function parseResponse(data) {
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    data = {};
                }
            }

            return data || {};
        }

        function normalizeTrack(track) {
            if (!track) return false;

            return {
                id: track.id,
                artist: track.artist || '',
                song: track.song || '',
                image: cleanUrl(track.image100 || track.image200 || track.image600 || ''),
                shareUrl: cleanUrl(track.shareUrl || '')
            };
        }

        function trackKey(track) {
            return track && ((track.id || '') + '|' + (track.artist || '') + '|' + (track.song || '')) || '';
        }

        function setTrack(track) {
            var normalized = normalizeTrack(track);

            if (trackKey(normalized) === trackKey(currentTrack)) return;

            currentTrack = normalized;
            emitState();
        }

        function findNowItem(data) {
            var list = parseResponse(data).result || [];
            var i;

            if (!Array.isArray(list) || !currentStation || !currentStation.id) return false;

            for (i = 0; i < list.length; i++) {
                if (String(list[i].id) === String(currentStation.id)) return list[i];
            }

            return false;
        }

        function clearTrackPoll() {
            clearTimeout(trackTimer);
            trackTimer = false;

            if (trackRequest && typeof trackRequest.clear === 'function') {
                try {
                    trackRequest.clear();
                } catch (e) {}
            }
        }

        function scheduleTrackPoll(delay) {
            clearTimeout(trackTimer);

            if (manualStop || !currentStation || !currentStation.id) return;

            trackTimer = setTimeout(refreshTrack, typeof delay === 'number' ? delay : TRACK_POLL_INTERVAL);
        }

        function refreshTrack() {
            if (manualStop || !currentStation || !currentStation.id) return;

            function done(data) {
                var item = findNowItem(data);

                if (item && item.track) setTrack(item.track);
                scheduleTrackPoll(TRACK_POLL_INTERVAL);
            }

            function fail() {
                scheduleTrackPoll(TRACK_POLL_INTERVAL);
            }

            if (trackRequest && typeof trackRequest["native"] === 'function') {
                trackRequest["native"](NOW_URL, done, fail, false, {
                    dataType: 'json'
                });
            } else if (window.fetch) {
                fetch(NOW_URL).then(function (response) {
                    return response.json();
                }).then(done)["catch"](fail);
            }
        }

        function clearStartupTimer() {
            clearTimeout(startTimer);
            startTimer = false;
        }

        function clearReconnect() {
            clearTimeout(reconnectTimer);
            reconnectTimer = false;
        }

        function start() {
            var promise;

            try {
                promise = audio.play();
            } catch (e) {
                scheduleReconnect();
                return;
            }

            if (promise && promise.then) {
                promise.then(function () {
                    console.log('Radio Record', 'start playing');
                })["catch"](function (e) {
                    console.log('Radio Record', 'play promise error:', e && e.message);
                    scheduleReconnect();
                });
            }
        }

        function loadNative() {
            audio.src = url;
            audio.load();
            start();
        }

        function cleanupMedia() {
            clearReconnect();
            clearTimeout(waitingTimer);
            clearStartupTimer();

            if (hls) {
                try {
                    if (typeof hls.stopLoad === 'function') hls.stopLoad();
                    if (typeof hls.detachMedia === 'function') hls.detachMedia();
                    hls.destroy();
                } catch (e) {}
                hls = false;
            }

            try {
                audio.pause();
            } catch (e2) {}

            audio.removeAttribute('src');
            audio.src = '';
            try {
                audio.load();
            } catch (e3) {}
        }

        function scheduleReconnect() {
            if (manualStop || !urlCandidates.length || reconnectTimer) return;

            loading = true;
            updateControls();

            reconnectTimer = setTimeout(function () {
                reconnectTimer = false;
                if (manualStop || !urlCandidates.length) return;
                if (urlCandidates.length > 1) urlIndex = (urlIndex + 1) % urlCandidates.length;
                url = urlCandidates[urlIndex];
                startCurrent();
            }, 1800);
        }

        function prepare() {
            var isHls = url.indexOf('.m3u8') > -1;
            var canNativeHls = audio.canPlayType && audio.canPlayType('audio/vnd.apple.mpegurl');
            var canHlsJs = typeof Hls !== 'undefined' && Hls && typeof Hls.isSupported === 'function' && Hls.isSupported();

            if (!isHls || canNativeHls || !canHlsJs) {
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
                    if (data && data.fatal) scheduleReconnect();
                });
                hls.on(Hls.Events.MANIFEST_LOADED, start);
            } catch (e) {
                scheduleReconnect();
            }
        }

        function startCurrent() {
            if (!url) return;

            cleanupMedia();
            manualStop = false;
            played = false;
            loading = true;
            updateControls();
            prepare();
            startTimer = setTimeout(function () {
                if (!manualStop && !played) scheduleReconnect();
            }, STREAM_START_TIMEOUT);
        }

        function pausePlayback() {
            manualStop = true;
            played = false;
            loading = false;
            clearTrackPoll();
            cleanupMedia();
            updateControls();
        }

        html.on('hover:enter click', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            if (played || loading) pausePlayback();
            else if (url) {
                startCurrent();
                scheduleTrackPoll(0);
            }
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
            pausePlayback();

            currentStation = data || {};
            currentTrack = false;
            urlCandidates = streamCandidates(currentStation);
            urlIndex = 0;
            url = urlCandidates[0] || '';

            if (!url) {
                if (Lampa.Noty) Lampa.Noty.show('У станции нет ссылки на поток');
                currentStation = false;
                updateControls();
                return;
            }

            html.find('.home-radio-record-player__name').text(data.title || 'Radio Record');
            html.toggleClass('hide', false);
            updateControls();
            startCurrent();
            scheduleTrackPoll(0);
        };

        this.toggle = function () {
            if (played || loading) pausePlayback();
            else if (url) {
                startCurrent();
                scheduleTrackPoll(0);
            }
        };

        this.stop = function (hide) {
            pausePlayback();
            url = '';
            urlCandidates = [];
            urlIndex = 0;
            currentStation = false;
            currentTrack = false;
            if (hide) html.toggleClass('hide', true);
            updateControls();
        };

        this.onState = function (listener) {
            if (typeof listener !== 'function') return function () {};

            stateListeners.push(listener);
            listener(currentState());

            return function () {
                var index = stateListeners.indexOf(listener);
                if (index > -1) stateListeners.splice(index, 1);
            };
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
        var lastNavTime = 0;

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
            var previous = active;

            if (!items || !items.length) return false;

            if (index < 0) index = 0;
            if (index >= items.length) index = items.length - 1;

            active = index;
            loadIconsAround(active);
            item = items[active];
            itemHtml = item.render();
            last = itemHtml[0];

            if (typeof previous === 'number' && items[previous]) items[previous].render().removeClass('focus hover');
            itemHtml.addClass('focus');
            scroll.update(itemHtml, true);

            try {
                Lampa.Controller.collectionFocus(itemHtml, scroll.render());
            } catch (e) {}

            return true;
        }

        function canNavigate() {
            var now = Date.now();

            if (now - lastNavTime < NAVIGATION_DELAY) return false;

            lastNavTime = now;
            return true;
        }

        function loadIconsAround(index) {
            var start = Math.max(0, index - 8);
            var end = Math.min(items.length - 1, index + 16);
            var i;

            for (i = start; i <= end; i++) {
                if (items[i] && items[i].load) items[i].load();
            }
        }

        function getColumnCount() {
            var first;
            var firstTop;
            var count = 0;
            var i;

            if (!items || !items.length) return 1;

            first = items[0].render()[0];
            if (!first) return 1;

            firstTop = first.offsetTop;

            for (i = 0; i < items.length; i++) {
                if (!items[i].render()[0] || Math.abs(items[i].render()[0].offsetTop - firstTop) > 4) break;
                count++;
            }

            return Math.max(1, count);
        }

        function findMoveIndex(direction) {
            var columns;
            var next;

            if (typeof active !== 'number') return 0;

            columns = getColumnCount();

            if (direction === 'left') {
                next = active - 1;
                if (active % columns === 0) return -1;
            } else if (direction === 'right') {
                next = active + 1;
                if (next >= items.length || next % columns === 0) return -1;
            } else if (direction === 'up') {
                next = active - columns;
                if (next < 0) return -1;
            } else if (direction === 'down') {
                next = active + columns;
                if (next >= items.length) return -1;
            }

            return typeof next === 'number' ? next : -1;
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
            if (!canNavigate()) return;
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
                    closeRadio();
                    return false;
                }
            });
        }

        function unbindKeys() {
            keyBound = false;
            $(document).off(KEY_NAMESPACE);
        }

        function stopRadio(hide) {
            unbindKeys();
            if (player && player.stop) player.stop(hide);
        }

        function closeRadio() {
            stopRadio(true);
            Lampa.Activity.backward();
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
                loadIconsAround(active);
            }
        };

        this.back = function () {
            closeRadio();
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
        this.stop = function () {
            stopRadio(true);
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            stopRadio(true);
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
