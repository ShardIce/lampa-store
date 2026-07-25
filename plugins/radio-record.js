/*
 * name: Radio Record
 * author: shardice
 * version: 1.1.18
 * description: Добавляет пункт Радио в левое меню Lampa, полный список каналов Radio Record и плеер с текущим треком.
 */

(function () {
    'use strict';

    var COMPONENT = 'home_radio_record';
    var RECORD_ORIGIN = 'https://www.radiorecord.ru';
    var STATIONS_URL = 'https://www.radiorecord.ru/api/stations/';
    var STATIONS_SOURCES = [{
        name: 'store',
        url: 'https://shardice.github.io/lampa-store/data/radio-record-stations.json'
    }, {
        name: 'official',
        url: STATIONS_URL
    }];
    var NOW_URL = 'https://www.radiorecord.ru/api/stations/now/';
    var KEY_NAMESPACE = 'keydown.home_radio_record';
    var NAVIGATION_DELAY = 0;
    var STREAM_START_TIMEOUT = 3000;
    var TRACK_POLL_INTERVAL = 12000;
    var TRACK_FALLBACK_POLL_INTERVAL = 20000;
    var TRACK_API_BACKOFF_THRESHOLD = 1;
    var TRACK_API_BACKOFF_INTERVAL = 90000;
    var TRACK_API_BACKOFF_MAX = 180000;
    var ICY_META_TIMEOUT = 18000;
    var ICY_META_MAX_BYTES = 1024 * 1024;
    var STREAM_RETRY_DELAY = 5000;
    var STREAM_RETRY_MAX_DELAY = 30000;
    var STREAM_START_WAITING_TIMEOUT = 18000;
    var STREAM_BUFFERING_NOTICE_TIMEOUT = 16000;
    var ACTION_LOCK_DELAY = 650;
    var STATIONS_CACHE_KEY = 'radio_record_stations_cache_v5';
    var STATIONS_CACHE_KEYS = [STATIONS_CACHE_KEY, 'radio_record_stations_cache_v3', 'radio_record_stations_cache_v2'];
    var STATIONS_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
    var STATIONS_MIN_COUNT = 110;
    var DEBUG_STORAGE_ENABLED = 'radio_record_debug_enabled';
    var DEBUG_STORAGE_VERBOSE = 'radio_record_debug_verbose';
    var DEBUG_STORAGE_TOKEN = 'radio_record_debug_bot_token';
    var DEBUG_STORAGE_CHAT = 'radio_record_debug_chat_id';
    var DEBUG_DEFAULT_TOKEN = '716098515:AAFlylwbW-fqSaPxfEgdhv5sqy6Sl73Megk';
    var DEBUG_DEFAULT_CHAT = '-1001301222162';
    var STREAM_MODE_STORAGE = 'radio_record_stream_mode';

    function addCss() {
        if ($('#home-radio-record-style').length) return;

        $('body').append('<style id="home-radio-record-style">' +
            '.home-radio-record-panel{display:flex;align-items:center;margin:0 1.22em 1.15em 1.22em;min-height:4.95em;padding:.62em .85em;border-radius:.34em;background:linear-gradient(90deg,rgba(246,73,0,.16),rgba(36,36,36,.97) 22%,rgba(25,25,25,.97));box-shadow:inset 0 0 0 .08em rgba(255,255,255,.07);box-sizing:border-box;}' +
            '.home-radio-record-panel__cover{width:3.75em;height:3.75em;border-radius:.24em;background-color:rgba(0,0,0,.26);box-shadow:inset 0 0 0 .08em rgba(255,255,255,.08);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;}' +
            '.home-radio-record-panel__cover img{width:100%;height:100%;object-fit:cover;opacity:1;}' +
            '.home-radio-record-panel__cover.is-icon img{width:78%;height:78%;object-fit:contain;opacity:1;}' +
            '.home-radio-record-panel__meta{min-width:0;margin-left:.95em;flex:1;}' +
            '.home-radio-record-panel__station{font-size:.78em;color:#F64900;font-weight:700;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-panel__track{font-size:1.18em;color:#fff;font-weight:700;line-height:1.12;margin-top:.16em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-panel__artist{font-size:.9em;color:rgba(255,255,255,.58);line-height:1.12;margin-top:.18em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-panel__debug{display:none;}' +
            '.home-radio-record-panel__actions{display:flex;align-items:center;margin-left:.8em;}' +
            '.home-radio-record-panel__btn{width:3.05em;height:3.05em;margin-left:.45em;border-radius:.28em;background-color:rgba(255,255,255,.07);box-shadow:inset 0 0 0 .08em rgba(255,255,255,.09);position:relative;flex-shrink:0;transition:background-color .12s ease,box-shadow .12s ease;}' +
            '.home-radio-record-panel__btn.focus,.home-radio-record-panel__btn.hover,.home-radio-record-panel__btn.radio-record-focus{background-color:rgba(246,73,0,.22);box-shadow:0 0 0 .1em rgba(255,255,255,.88),0 .22em .9em rgba(246,73,0,.22);}' +
            '.home-radio-record-panel__toggle:before{content:"";position:absolute;left:50%;top:50%;transform:translate(-37%,-50%);width:0;height:0;border-top:.58em solid transparent;border-bottom:.58em solid transparent;border-left:.88em solid #fff;}' +
            '.home-radio-record-panel.is-playing .home-radio-record-panel__toggle:before,.home-radio-record-panel.is-playing .home-radio-record-panel__toggle:after{content:"";position:absolute;top:32%;width:.28em;height:36%;border:0;background-color:#fff;transform:none;}' +
            '.home-radio-record-panel.is-playing .home-radio-record-panel__toggle:before{left:38%;}' +
            '.home-radio-record-panel.is-playing .home-radio-record-panel__toggle:after{left:55%;}' +
            '.home-radio-record-panel.is-loading .home-radio-record-panel__toggle:before{content:"";left:50%;top:50%;width:1em;height:1em;border:.18em solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:100%;transform:translate(-50%,-50%);animation:home-radio-record-panel-loading .85s linear infinite;}' +
            '.home-radio-record-panel.is-loading .home-radio-record-panel__toggle:after{display:none;}' +
            '.home-radio-record-panel__close:before,.home-radio-record-panel__close:after{content:"";position:absolute;left:32%;top:48%;width:36%;height:.14em;background-color:#fff;border-radius:.1em;}' +
            '.home-radio-record-panel__close:before{transform:rotate(45deg);}' +
            '.home-radio-record-panel__close:after{transform:rotate(-45deg);}' +
            '.home-radio-record-item{margin-left:1em;margin-bottom:1em;width:12.5%;flex-shrink:0;padding:.22em;border-radius:.36em;transition:background-color .12s ease;}' +
            '.home-radio-record-item__imgbox{background-color:rgba(255,255,255,.025);padding-bottom:83%;position:relative;border:.08em solid rgba(255,255,255,.07);border-radius:.18em;overflow:hidden;box-sizing:border-box;transition:border-color .12s ease,box-shadow .12s ease,background-color .12s ease;}' +
            '.home-radio-record-item__img{position:absolute;top:11%;left:11%;width:78%;height:78%;object-fit:contain;opacity:1;transition:opacity .12s ease;}' +
            '.home-radio-record-item__name{font-size:1.02em;margin-top:.7em;color:rgba(255,255,255,.72);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
            '.home-radio-record-item.focus,.home-radio-record-item.hover,.home-radio-record-item.radio-record-focus{background-color:rgba(255,255,255,.045);}' +
            '.home-radio-record-item.focus .home-radio-record-item__imgbox,.home-radio-record-item.hover .home-radio-record-item__imgbox,.home-radio-record-item.radio-record-focus .home-radio-record-item__imgbox{border-color:rgba(255,255,255,.95);box-shadow:0 0 0 .08em rgba(255,255,255,.32),inset 0 0 0 .06em rgba(255,255,255,.12);background-color:rgba(255,255,255,.06);}' +
            '.home-radio-record-item.focus .home-radio-record-item__img,.home-radio-record-item.hover .home-radio-record-item__img,.home-radio-record-item.radio-record-focus .home-radio-record-item__img{opacity:1;}' +
            '.home-radio-record-item.playing .home-radio-record-item__imgbox{border-color:#F64900;background-color:rgba(246,73,0,.13);box-shadow:0 0 0 .08em rgba(246,73,0,.5),0 .3em 1em rgba(246,73,0,.2);}' +
            '.home-radio-record-item.playing.focus .home-radio-record-item__imgbox,.home-radio-record-item.playing.hover .home-radio-record-item__imgbox,.home-radio-record-item.playing.radio-record-focus .home-radio-record-item__imgbox{border-color:#F64900;box-shadow:0 0 0 .1em rgba(255,255,255,.92),0 0 0 .22em rgba(246,73,0,.7),0 .35em 1.15em rgba(246,73,0,.28);}' +
            '.home-radio-record-item.playing .home-radio-record-item__name{color:#fff;}' +
            '@keyframes home-radio-record-sound{0%{height:.1em}100%{height:1em}}' +
            '@keyframes home-radio-record-loading{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(360deg)}}' +
            '@keyframes home-radio-record-panel-loading{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(360deg)}}' +
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
            '.home-radio-record-player.loading .home-radio-record-player__button:before{content:"";position:absolute;left:50%;top:50%;display:block;box-sizing:border-box;border:.18em solid rgba(255,255,255,.32);border-top-color:#fff;transform:translate(-50%,-50%);animation:home-radio-record-loading 1s linear infinite;width:.95em;height:.95em;border-radius:100%;}' +
            '.home-radio-record-player.loading .home-radio-record-player__button i{display:none;}' +
            '.home-radio-record-player.focus{background-color:#fff;color:#000;}' +
            '.home-radio-record-player.focus .home-radio-record-player__button{border-color:#000;}' +
            '.home-radio-record-player.focus .home-radio-record-player__button i,.home-radio-record-player.focus .home-radio-record-player__button:after{background-color:#000;}' +
            '.home-radio-record-player.focus .home-radio-record-player__button:before{border-top-color:#000;}' +
            '@media screen and (max-width:580px){.home-radio-record-panel{margin:.2em 1.22em 1em 1.22em}.home-radio-record-panel__cover{width:3.55em;height:3.55em}.home-radio-record-panel__track{font-size:1.05em}.home-radio-record-panel__artist{font-size:.85em}.home-radio-record-panel__btn{width:2.65em;height:2.65em}.home-radio-record-item{width:20%;}}' +
            '@media screen and (max-width:385px){.home-radio-record-player__name,.home-radio-record-item__name{display:none}.home-radio-record-panel{margin-left:1.22em;margin-right:1.22em}.home-radio-record-panel__artist{display:none}.home-radio-record-panel__cover{width:3.1em;height:3.1em}.home-radio-record-panel__actions{margin-left:.45em}.home-radio-record-panel__btn{width:2.35em;height:2.35em}.home-radio-record-item{width:25%;}}' +
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
        return String(url || '').replace('http://localhost:6081', '').trim();
    }

    function recordUrl(url) {
        url = cleanUrl(url);

        if (!url) return '';
        if (url.indexOf('//') === 0) return 'https:' + url;
        if (url.charAt(0) === '/') return RECORD_ORIGIN + url;

        return url;
    }

    function iconVariant(url, variant) {
        url = cleanUrl(url);

        if (!url || !variant) return '';

        return url.replace(/_image600_(gray_outline|white_fill|colored_fill)(\.[a-z0-9]+)(\?|$)/i, '_image600_' + variant + '$2$3');
    }

    function storageGet(key, fallback) {
        try {
            if (Lampa.Storage && typeof Lampa.Storage.get === 'function') return Lampa.Storage.get(key, fallback);
        } catch (e) {}

        return fallback;
    }

    function storageSet(key, value) {
        try {
            if (Lampa.Storage && typeof Lampa.Storage.set === 'function') Lampa.Storage.set(key, value);
        } catch (e) {}
    }

    var RadioDebug = (function () {
        var listeners = [];
        var queue = [];
        var logLines = [];
        var flushTimer = false;
        var documentTimer = false;
        var lastDocumentReason = '';
        var session = false;
        var lastEvent = 'ready';
        var lastText = 'diag ready';
        var sequence = 0;

        function now() {
            return window.performance && performance.now ? performance.now() : Date.now();
        }

        function enabled() {
            return String(storageGet(DEBUG_STORAGE_ENABLED, '1')) !== '0';
        }

        function verbose() {
            return String(storageGet(DEBUG_STORAGE_VERBOSE, '0')) === '1';
        }

        function telegramToken() {
            var config = window.home_radio_record_debug || {};

            return storageGet(DEBUG_STORAGE_TOKEN, config.token || DEBUG_DEFAULT_TOKEN) || DEBUG_DEFAULT_TOKEN;
        }

        function telegramChat() {
            var config = window.home_radio_record_debug || {};

            return storageGet(DEBUG_STORAGE_CHAT, config.chat || DEBUG_DEFAULT_CHAT) || DEBUG_DEFAULT_CHAT;
        }

        function ms(value) {
            value = Math.max(0, Math.round(value || 0));

            if (value < 1000) return value + 'ms';

            return (value / 1000).toFixed(value < 10000 ? 2 : 1) + 's';
        }

        function since(start) {
            return start ? now() - start : 0;
        }

        function compactValue(value) {
            if (value === null || typeof value === 'undefined') return '';
            if (typeof value === 'number') return Math.round(value) === value ? String(value) : value.toFixed(2);
            if (typeof value === 'boolean') return value ? 'true' : 'false';

            value = String(value);
            if (value.length > 120) value = value.substring(0, 117) + '...';

            return value;
        }

        function compact(data) {
            var result = [];

            data = data || {};

            Object.keys(data).forEach(function (key) {
                var value = data[key];

                if (typeof value === 'undefined' || value === null || value === '') return;
                result.push(key + '=' + compactValue(value));
            });

            return result.join(', ');
        }

        function emit() {
            listeners.slice().forEach(function (listener) {
                try {
                    listener(statusText());
                } catch (e) {}
            });
        }

        function setLast(event, data) {
            var prefix = session && !session.done ? ms(since(session.start)) + ' ' : '';

            lastEvent = event;
            lastText = prefix + event + (data ? ' | ' + compact(data) : '');
            emit();
        }

        function telegramLine(item) {
            var lines = [
                'Radio Record debug #' + item.id,
                item.time,
                item.event
            ];

            if (item.session) lines.push('timer: ' + item.session);
            if (item.data) lines.push(item.data);

            return lines.join('\n');
        }

        function fileName() {
            return 'radio-record-debug-' + new Date().toISOString().replace(/[:.]/g, '-') + '.txt';
        }

        function fileText(reason) {
            var header = [
                'Radio Record debug log',
                'reason: ' + reason,
                'created: ' + new Date().toISOString(),
                'events: ' + logLines.length,
                ''
            ];

            return header.concat(logLines).join('\n');
        }

        function sendByImage(token, chat, text) {
            var img = new Image();

            img.src = 'https://api.telegram.org/bot' + token + '/sendMessage?chat_id=' +
                encodeURIComponent(chat) + '&disable_web_page_preview=true&text=' + encodeURIComponent(text);
        }

        function flush() {
            var token = telegramToken();
            var chat = telegramChat();
            var text;
            var form;

            clearTimeout(flushTimer);
            flushTimer = false;

            if (!queue.length || !token || !chat) return;

            text = queue.splice(0, 8).map(telegramLine).join('\n\n');

            if (window.fetch && window.FormData) {
                form = new FormData();
                form.append('chat_id', chat);
                form.append('disable_web_page_preview', 'true');
                form.append('text', text);

                fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
                    method: 'POST',
                    body: form,
                    mode: 'no-cors'
                })["catch"](function () {
                    sendByImage(token, chat, text);
                });
            } else {
                sendByImage(token, chat, text);
            }

            if (queue.length) flushTimer = setTimeout(flush, 1200);
        }

        function sendTextFallback(reason, text) {
            var token = telegramToken();
            var chat = telegramChat();
            var chunk = text.slice(-3500);

            if (!token || !chat) return;

            queue.push({
                id: ++sequence,
                time: new Date().toISOString(),
                event: 'debug.log.fallback',
                session: '',
                data: 'reason=' + compactValue(reason) + '\n' + chunk
            });

            if (!flushTimer) flushTimer = setTimeout(flush, 100);
        }

        function sendDocument(reason) {
            var token = telegramToken();
            var chat = telegramChat();
            var text;
            var form;

            if (!enabled() || !token || !chat || !logLines.length) return false;

            reason = reason || 'manual';
            text = fileText(reason);

            if (!window.fetch || !window.FormData || !window.Blob) {
                sendTextFallback(reason, text);
                return false;
            }

            form = new FormData();
            form.append('chat_id', chat);
            form.append('caption', 'Radio Record debug: ' + reason);
            form.append('document', new Blob([text], {
                type: 'text/plain;charset=utf-8'
            }), fileName());

            fetch('https://api.telegram.org/bot' + token + '/sendDocument', {
                method: 'POST',
                body: form,
                mode: 'no-cors'
            }).then(function (response) {
                if (response && response.type !== 'opaque' && !response.ok) sendTextFallback(reason, text);
            })["catch"](function () {
                sendTextFallback(reason, text);
            });

            return true;
        }

        function scheduleDocument(reason, delay) {
            lastDocumentReason = reason || lastDocumentReason || 'auto';
            clearTimeout(documentTimer);
            documentTimer = setTimeout(function () {
                documentTimer = false;
                sendDocument(lastDocumentReason);
            }, typeof delay === 'number' ? delay : 1200);
        }

        function log(event, data) {
            var elapsed;
            var item;
            var localOnly;
            var sendMessage;
            var quiet;

            if (!enabled()) return false;

            data = data || {};
            localOnly = data._local;
            sendMessage = data._message;
            quiet = data._quiet;
            delete data._local;
            delete data._message;
            delete data._quiet;

            if (localOnly && !verbose()) return false;

            elapsed = session ? since(session.start) : 0;
            sequence++;

            item = {
                id: sequence,
                time: new Date().toISOString(),
                event: event,
                session: session ? ms(elapsed) : '',
                data: compact(data)
            };

            setLast(event, data);
            logLines.push('[' + item.time + '] #' + item.id + ' ' + item.event + (item.session ? ' +' + item.session : '') + (item.data ? ' | ' + item.data : ''));
            if (logLines.length > 600) logLines.shift();

            if (!quiet) {
                try {
                    console.log('Radio Record debug', item.event, item.session, data);
                } catch (e) {}
            }

            if (telegramToken() && !localOnly && sendMessage) {
                queue.push(item);
                if (!flushTimer) flushTimer = setTimeout(flush, 900);
            }

            return item;
        }

        function startSession(name, data) {
            session = {
                name: name,
                start: now(),
                done: false
            };

            log(name + '.start', data);
            return session;
        }

        function finishSession(event, data) {
            if (session) {
                data = data || {};
                data.total = ms(since(session.start));
                session.done = true;
            }

            log(event, data);
            session = false;
            emit();
            scheduleDocument(event, 700);
        }

        function measure(name, data) {
            return {
                name: name,
                start: now(),
                data: data || {}
            };
        }

        function end(mark, event, data) {
            data = data || {};
            data.duration = ms(since(mark && mark.start));

            log(event || mark.name + '.done', data);
        }

        function statusText() {
            if (!enabled()) return '';
            if (session && !session.done) return ms(since(session.start)) + ' | ' + lastEvent;

            return lastText;
        }

        window.home_radio_record_set_debug = function (token, chat, isEnabled, verboseMode) {
            storageSet(DEBUG_STORAGE_TOKEN, token || DEBUG_DEFAULT_TOKEN);
            storageSet(DEBUG_STORAGE_CHAT, chat || DEBUG_DEFAULT_CHAT);
            storageSet(DEBUG_STORAGE_ENABLED, isEnabled === false ? '0' : '1');
            storageSet(DEBUG_STORAGE_VERBOSE, verboseMode ? '1' : '0');
            log('debug.config.saved', {
                telegram: token ? 'enabled' : 'missing-token',
                chat: chat || DEBUG_DEFAULT_CHAT,
                verbose: verboseMode ? 'on' : 'off'
            });
        };

        window.home_radio_record_send_debug = function (reason) {
            return sendDocument(reason || 'manual');
        };

        window.home_radio_record_set_stream_mode = function (mode) {
            mode = String(mode || 'stable').toLowerCase();
            if (mode !== 'stable' && mode !== 'direct') mode = 'stable';
            storageSet(STREAM_MODE_STORAGE, mode);
            log('stream.mode.saved', {
                mode: mode
            });
        };

        return {
            now: now,
            ms: ms,
            since: since,
            log: log,
            startSession: startSession,
            finishSession: finishSession,
            measure: measure,
            end: end,
            sendDocument: sendDocument,
            scheduleDocument: scheduleDocument,
            enabled: enabled,
            statusText: statusText,
            onStatus: function (listener) {
                if (typeof listener !== 'function') return function () {};

                listeners.push(listener);
                listener(statusText());

                return function () {
                    var index = listeners.indexOf(listener);
                    if (index > -1) listeners.splice(index, 1);
                };
            }
        };
    })();

    function normalizeStation(station, index) {
        var rawIcon = cleanUrl(station.icon);
        var iconGray = cleanUrl(station.icon_gray) || iconVariant(rawIcon, 'gray_outline');
        var iconWhite = cleanUrl(station.icon_fill_white) || iconVariant(rawIcon, 'white_fill');
        var iconColored = cleanUrl(station.icon_fill_colored) || iconVariant(rawIcon, 'colored_fill');
        var iconActive = cleanUrl(station.icon_active) || iconVariant(rawIcon, 'colored_fill');
        var sort = parseInt(station.sort, 10);

        if (isNaN(sort)) sort = index;

        return {
            id: station.id,
            prefix: station.prefix,
            title: station.title || station.short_title || 'Radio Record',
            sort: sort,
            icon: iconGray || rawIcon || iconColored || iconWhite,
            icon_active: iconColored || iconActive || rawIcon || iconGray || iconWhite,
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
            if (Array.isArray(data)) source = data;
            else if (data.result && Array.isArray(data.result.stations)) source = data.result.stations;
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

    function readStationsCache() {
        var cache;
        var age;
        var i;
        var key;

        for (i = 0; i < STATIONS_CACHE_KEYS.length; i++) {
            key = STATIONS_CACHE_KEYS[i];
            cache = storageGet(key, false);

            if (typeof cache === 'string') {
                try {
                    cache = JSON.parse(cache);
                } catch (e) {
                    cache = false;
                }
            }

            if (!cache || !Array.isArray(cache.stations) || !cache.stations.length) continue;

            age = Date.now() - (cache.time || 0);
            cache.stations = parseStations(cache.stations);
            if (cache.stations.length < STATIONS_MIN_COUNT) continue;

            return {
                key: key,
                stations: cache.stations,
                stale: age > STATIONS_CACHE_TTL,
                age: age
            };
        }

        return false;
    }

    function writeStationsCache(stations) {
        if (!stations || !stations.length) return;

        storageSet(STATIONS_CACHE_KEY, {
            time: Date.now(),
            stations: stations
        });
    }

    function requestErrorData(xhr, status, error) {
        var data = {};

        if (xhr && typeof xhr.status !== 'undefined') data.http = xhr.status;
        if (xhr && xhr.statusText) data.statusText = xhr.statusText;
        if (status) data.status = status;
        if (error) data.error = error.message || String(error);

        return data;
    }

    function decodeBinaryUtf8(value) {
        try {
            return decodeURIComponent(escape(value));
        } catch (e) {
            return value;
        }
    }

    function parseIcyTitle(value) {
        var title = String(value || '').replace(/\0/g, '').replace(/\s+/g, ' ').trim();
        var divider;
        var artist;
        var song;

        if (!title) return false;

        title = title.replace(/^StreamTitle=['"]?/i, '').replace(/['"]?;?$/g, '').trim();
        divider = title.indexOf(' - ');
        if (divider < 0) divider = title.indexOf(' – ');
        if (divider < 0) divider = title.indexOf(' — ');

        if (divider > -1) {
            artist = title.substring(0, divider).trim();
            song = title.substring(divider + 3).trim();
        } else {
            artist = '';
            song = title;
        }

        if (!artist && !song) return false;

        return {
            id: 'icy:' + title.toLowerCase(),
            artist: artist,
            song: song,
            image: '',
            shareUrl: ''
        };
    }

    function upgradeArtwork(url) {
        url = recordUrl(url);

        if (!url) return '';

        return url
            .replace(/\/[0-9]+x[0-9]+bb\.(jpg|jpeg|png)(\?|$)/i, '/600x600bb.$1$2')
            .replace(/\/[0-9]+x[0-9]+-?[0-9]*bb\.(jpg|jpeg|png)(\?|$)/i, '/600x600bb.$1$2');
    }

    function StationItem(data) {
        var html = Lampa.Template.get('home_radio_record_item', {
            name: data.title || 'Radio Record'
        });
        var img = html.find('img')[0];
        var loaded = false;
        var activeIcon = false;
        var currentSrc = '';
        var iconRequestAt = 0;

        html.attr('title', data.title || 'Radio Record');
        if (data.prefix) html.attr('data-prefix', data.prefix);

        img.onload = function () {
            RadioDebug.log('station.icon.loaded', {
                station: data.title,
                ms: RadioDebug.ms(RadioDebug.since(iconRequestAt)),
                _local: true,
                _quiet: true
            });
        };

        img.onerror = function () {
            RadioDebug.log('station.icon.error', {
                station: data.title,
                ms: RadioDebug.ms(RadioDebug.since(iconRequestAt)),
                _local: true,
                _quiet: true
            });
            img.src = './img/img_broken.svg';
        };
        img.loading = 'lazy';
        img.decoding = 'async';

        this.data = data;

        function wantedIcon() {
            return activeIcon && data.icon_active || data.icon || '';
        }

        function setIconSource(force) {
            var next = wantedIcon();

            if (!next || (!force && currentSrc === next)) return;

            currentSrc = next;
            iconRequestAt = RadioDebug.now();
            RadioDebug.log('station.icon.request', {
                station: data.title,
                active: activeIcon ? 'yes' : 'no',
                _local: true,
                _quiet: true
            });
            img.src = next;
        }

        this.load = function () {
            if (loaded) return;
            loaded = true;
            img.loading = 'eager';
            setIconSource(true);
        };

        this.setPlaying = function (isPlaying) {
            activeIcon = !!isPlaying;
            html.toggleClass('playing', activeIcon);
            if (loaded) setIconSource(false);
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            img.onerror = function () {};
            img.onload = function () {};
            img.src = '';
            loaded = false;
            activeIcon = false;
            currentSrc = '';
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
        var playRequestId = 0;
        var reconnectAttempts = 0;
        var reconnectCycles = 0;
        var lastToggleAt = 0;
        var lastPlayAt = 0;
        var lastPlayKey = '';
        var manualStop = true;
        var currentStation = false;
        var currentTrack = false;
        var stateListeners = [];
        var trackRequest = false;
        var nowCache = false;
        var nowCacheTime = 0;
        var nowRequestBusy = false;
        var nowRequestId = 0;
        var nowCallbacks = [];
        var nowFailCount = 0;
        var nowDisabledUntil = 0;
        var icyTrackBusy = false;
        var artworkCache = {};

        try {
            trackRequest = new Lampa.Reguest();
        } catch (e) {}

        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';

        function staleAudioEvent() {
            return manualStop || !currentStation;
        }

        audio.addEventListener('play', function () {
            if (staleAudioEvent()) return;

            RadioDebug.log('audio.event.play', {
                station: currentStation && currentStation.title
            });
        });

        audio.addEventListener('loadstart', function () {
            if (staleAudioEvent()) return;

            RadioDebug.log('audio.event.loadstart', {
                station: currentStation && currentStation.title,
                candidate: urlIndex + 1
            });
        });

        audio.addEventListener('loadedmetadata', function () {
            if (staleAudioEvent()) return;

            clearTimeout(waitingTimer);
            RadioDebug.log('audio.event.loadedmetadata', {
                station: currentStation && currentStation.title
            });
        });

        audio.addEventListener('canplay', function () {
            if (staleAudioEvent()) return;

            clearTimeout(waitingTimer);
            RadioDebug.log('audio.event.canplay', {
                station: currentStation && currentStation.title
            });
        });

        audio.addEventListener('error', function () {
            if (staleAudioEvent()) {
                RadioDebug.log('audio.event.error.stale', {
                    code: audio.error && audio.error.code,
                    _local: true,
                    _quiet: true
                });
                return;
            }

            RadioDebug.log('audio.event.error', {
                station: currentStation && currentStation.title,
                code: audio.error && audio.error.code
            });
            if (!audio.error || audio.error.code !== 1) scheduleReconnect('audio-error');
        });

        audio.addEventListener('ended', function () {
            if (staleAudioEvent()) return;

            RadioDebug.log('audio.event.ended', {
                station: currentStation && currentStation.title
            });
            scheduleReconnect('audio-ended');
        });
        audio.addEventListener('stalled', function () {
            if (staleAudioEvent()) return;

            RadioDebug.log('audio.event.stalled', {
                station: currentStation && currentStation.title
            });
        });
        audio.addEventListener('waiting', function () {
            if (staleAudioEvent()) return;

            RadioDebug.log('audio.event.waiting', {
                station: currentStation && currentStation.title,
                readyState: audio.readyState
            });
            clearTimeout(waitingTimer);
            waitingTimer = setTimeout(function () {
                if (manualStop || audio.paused || audio.readyState >= 3) return;

                if (!played) {
                    scheduleReconnect('startup-waiting-long');
                    return;
                }

                RadioDebug.log('audio.buffering.long', {
                    station: currentStation && currentStation.title,
                    readyState: audio.readyState,
                    candidate: urlIndex + 1
                });

                if (hls && typeof hls.startLoad === 'function') {
                    try {
                        hls.startLoad(-1);
                        RadioDebug.log('hls.buffering.resume', {
                            station: currentStation && currentStation.title
                        });
                    } catch (e) {}
                }
            }, played ? STREAM_BUFFERING_NOTICE_TIMEOUT : STREAM_START_WAITING_TIMEOUT);
        });

        audio.addEventListener('playing', function () {
            if (staleAudioEvent()) {
                RadioDebug.log('audio.event.playing.stale', {
                    _local: true,
                    _quiet: true
                });
                return;
            }

            played = true;
            loading = false;
            reconnectAttempts = 0;
            reconnectCycles = 0;
            clearTimeout(waitingTimer);
            clearTimeout(startTimer);
            clearReconnect();
            updateControls();
            RadioDebug.finishSession('stream.playing', {
                station: currentStation && currentStation.title,
                candidate: urlIndex + 1,
                readyState: audio.readyState
            });
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

        function streamMode() {
            var mode = String(storageGet(STREAM_MODE_STORAGE, 'stable') || 'stable').toLowerCase();

            if (mode !== 'stable' && mode !== 'direct') mode = 'stable';

            return mode;
        }

        function canUseHls() {
            var nativeHls = audio.canPlayType && (
                audio.canPlayType('audio/vnd.apple.mpegurl') ||
                audio.canPlayType('application/vnd.apple.mpegurl')
            );
            var hlsJs = typeof Hls !== 'undefined' && Hls && typeof Hls.isSupported === 'function' && Hls.isSupported();

            return !!(nativeHls || hlsJs);
        }

        function streamCandidates(data) {
            var result = [];
            var hlsUrl = data && data.stream_hls;
            var hlsOk = hlsUrl && canUseHls();

            if (streamMode() === 'stable' && hlsOk) addCandidate(result, hlsUrl);
            addCandidate(result, data && data.stream_320);
            if (streamMode() !== 'stable' && hlsOk) addCandidate(result, hlsUrl);
            if (!result.length) addCandidate(result, data && data.stream_128);

            return result;
        }

        function stationKey(data) {
            return data && (data.prefix || data.id || data.title) || '';
        }

        function sameStation(data) {
            return stationKey(data) && stationKey(data) === stationKey(currentStation);
        }

        function lockToggle() {
            var now = Date.now();

            if (now - lastToggleAt < ACTION_LOCK_DELAY) {
                RadioDebug.log('player.toggle.duplicate', {
                    _local: true,
                    _quiet: true
                });
                return true;
            }

            lastToggleAt = now;
            return false;
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
                image: recordUrl(track.image || track.image200 || track.image100 || track.image600 || ''),
                shareUrl: recordUrl(track.shareUrl || '')
            };
        }

        function trackKey(track) {
            return track && ((track.id || '') + '|' + (track.artist || '') + '|' + (track.song || '')) || '';
        }

        function setTrack(track) {
            var normalized = normalizeTrack(track);
            var sameTrack;

            if (!normalized) return;

            sameTrack = trackKey(normalized) === trackKey(currentTrack);
            if (sameTrack && currentTrack && (!normalized.image || normalized.image === currentTrack.image)) return;

            currentTrack = normalized;
            RadioDebug.log('track.info.received', {
                artist: normalized.artist,
                song: normalized.song,
                image: normalized.image ? 'yes' : 'no'
            });
            emitState();
        }

        function findNowItem(data) {
            var response = data ? parseResponse(data) : {};
            var list = response.result || nowCache || [];
            var i;

            if (!Array.isArray(list) || !currentStation || !currentStation.id) return false;

            for (i = 0; i < list.length; i++) {
                if (String(list[i].id) === String(currentStation.id)) return list[i];
            }

            return false;
        }

        function runNowCallbacks(success, data) {
            var callbacks = nowCallbacks.slice();

            nowCallbacks = [];
            nowRequestBusy = false;

            callbacks.forEach(function (callback) {
                try {
                    if (success) callback.done(data);
                    else callback.fail(data);
                } catch (e) {}
            });
        }

        function fetchNow(done, fail) {
            var requestId;
            var mark;
            var methods = [];

            done = done || function () {};
            fail = fail || function () {};
            nowCallbacks.push({
                done: done,
                fail: fail
            });

            if (nowRequestBusy) return;

            nowRequestBusy = true;
            nowRequestId++;
            requestId = nowRequestId;
            mark = RadioDebug.measure('track.api', {
                url: 'stations/now'
            });
            RadioDebug.log('track.api.request', {
                url: 'stations/now'
            });

            function ok(data, method) {
                data = parseResponse(data);

                if (requestId !== nowRequestId) return;

                if (Array.isArray(data.result)) {
                    nowCache = data.result;
                    nowCacheTime = Date.now();
                }

                nowFailCount = 0;
                nowDisabledUntil = 0;

                RadioDebug.end(mark, 'track.api.response', {
                    count: Array.isArray(data.result) ? data.result.length : 0,
                    method: method || 'unknown'
                });
                runNowCallbacks(true, data);
            }

            function bad(method, xhr, status, error) {
                var data;

                if (requestId !== nowRequestId) return;

                data = requestErrorData(xhr, status, error);
                data.method = method || 'unknown';
                RadioDebug.log('track.api.method.error', data);
                next();
            }

            function next() {
                var method = methods.shift();

                if (requestId !== nowRequestId) return;

                if (!method) {
                    RadioDebug.end(mark, 'track.api.error');
                    runNowCallbacks(false, 'api-error');
                    return;
                }

                RadioDebug.log('track.api.method', {
                    method: method.name
                });

                method.run(function (data) {
                    data = parseResponse(data);

                    if (!data || !Array.isArray(data.result)) {
                        bad(method.name, false, 'empty', 'empty-result');
                        return;
                    }

                    ok(data, method.name);
                }, function (xhr, status, error) {
                    bad(method.name, xhr, status, error);
                });
            }

            if (trackRequest && typeof trackRequest["native"] === 'function') {
                methods.push({
                    name: 'native',
                    run: function (success, failure) {
                        trackRequest["native"](NOW_URL, success, failure, false, {
                            dataType: 'json'
                        });
                    }
                });
            }

            if (window.fetch) {
                methods.push({
                    name: 'fetch',
                    run: function (success, failure) {
                        fetch(NOW_URL, {
                            cache: 'no-store'
                        }).then(function (response) {
                            if (!response || !response.ok) throw response;
                            return response.json();
                        }).then(success)["catch"](function (error) {
                            failure(error, error && error.statusText, error);
                        });
                    }
                });
            }

            next();
        }

        function readIcyTitle(text, binary) {
            var start;
            var end;
            var value;

            text = String(text || '');
            start = text.indexOf("StreamTitle='");
            if (start < 0) return false;

            start += 13;
            end = text.indexOf("';", start);
            if (end < 0) return false;

            value = text.substring(start, end);

            return binary ? decodeBinaryUtf8(value) : value;
        }

        function directStreamUrl() {
            return cleanUrl(currentStation && (currentStation.stream_320 || currentStation.stream_128));
        }

        function bytesToText(bytes) {
            var result = '';
            var i;

            for (i = 0; bytes && i < bytes.length; i++) result += String.fromCharCode(bytes[i]);

            return decodeBinaryUtf8(result);
        }

        function fetchIcyTrack(success, failure) {
            var streamUrl = directStreamUrl();
            var mark;
            var settled = false;
            var timer = false;
            var controller = false;
            var reader = false;
            var xhr = false;
            var xhrStarted = false;
            var decoder = window.TextDecoder ? new TextDecoder('utf-8') : false;
            var buffer = '';
            var received = 0;

            success = success || function () {};
            failure = failure || function () {};

            if (!streamUrl) {
                failure('no-stream');
                return;
            }

            mark = RadioDebug.measure('track.icy', {
                station: currentStation && currentStation.title
            });
            RadioDebug.log('track.icy.request', {
                station: currentStation && currentStation.title,
                source: streamUrl.indexOf('hostingradio') > -1 ? 'hostingradio' : 'stream'
            });

            function cleanup() {
                clearTimeout(timer);

                if (reader && reader.cancel) {
                    try {
                        reader.cancel();
                    } catch (e) {}
                }

                if (controller) {
                    try {
                        controller.abort();
                    } catch (e2) {}
                }

                if (xhr) {
                    try {
                        xhr.abort();
                    } catch (e3) {}
                }
            }

            function finish(track, reason) {
                if (settled) return;

                settled = true;
                cleanup();

                if (track) {
                    RadioDebug.end(mark, 'track.icy.response', {
                        artist: track.artist,
                        song: track.song
                    });
                    success(track);
                } else {
                    RadioDebug.end(mark, 'track.icy.error', {
                        reason: reason || 'unknown'
                    });
                    failure(reason || 'unknown');
                }
            }

            function scan(text, binary) {
                var title = readIcyTitle(text, binary);
                var track;

                if (!title) return false;

                track = parseIcyTitle(title);
                if (track) {
                    finish(track);
                    return true;
                }

                return false;
            }

            function startXhr() {
                if (xhrStarted || settled) return;
                xhrStarted = true;

                if (!window.XMLHttpRequest) {
                    finish(false, 'unsupported');
                    return;
                }

                try {
                    RadioDebug.log('track.icy.method', {
                        method: 'xhr'
                    });
                    xhr = new XMLHttpRequest();
                    xhr.open('GET', streamUrl, true);
                    xhr.setRequestHeader('Icy-MetaData', '1');
                    if (xhr.overrideMimeType) xhr.overrideMimeType('text/plain; charset=x-user-defined');

                    xhr.onprogress = function () {
                        var text = xhr.responseText || '';
                        var tail = text.slice(Math.max(0, text.length - 24000));

                        received = text.length;
                        scan(tail, true);

                        if (!settled && received > ICY_META_MAX_BYTES) finish(false, 'max-bytes');
                    };

                    xhr.onerror = function () {
                        finish(false, 'xhr-error');
                    };

                    xhr.onreadystatechange = function () {
                        if (settled || xhr.readyState !== 4) return;

                        if (scan(xhr.responseText || '', true)) return;

                        RadioDebug.log('track.icy.xhr.done', {
                            status: xhr.status,
                            bytes: (xhr.responseText || '').length,
                            _quiet: true
                        });
                        finish(false, 'xhr-done');
                    };

                    xhr.send();
                } catch (e) {
                    finish(false, e && e.message || 'xhr-throw');
                }
            }

            function startFetch() {
                var options;

                if (!window.fetch) {
                    startXhr();
                    return;
                }

                RadioDebug.log('track.icy.method', {
                    method: 'fetch'
                });
                if (window.AbortController) controller = new AbortController();

                options = {
                    cache: 'no-store',
                    mode: 'cors',
                    headers: {
                        'Icy-MetaData': '1'
                    }
                };
                if (controller) options.signal = controller.signal;

                fetch(streamUrl, options).then(function (response) {
                    if (!response || !response.body || !response.body.getReader) {
                        RadioDebug.log('track.icy.fetch.no-stream', {
                            status: response && response.status,
                            _quiet: true
                        });
                        startXhr();
                        return;
                    }

                    reader = response.body.getReader();

                    function pump() {
                        reader.read().then(function (part) {
                            if (settled) return;

                            if (!part || part.done) {
                                finish(false, 'stream-done');
                                return;
                            }

                            received += part.value && part.value.length || 0;
                            buffer += decoder ? decoder.decode(part.value, {
                                stream: true
                            }) : bytesToText(part.value);

                            if (buffer.length > 24000) buffer = buffer.slice(-24000);
                            if (scan(buffer, false)) return;
                            if (received > ICY_META_MAX_BYTES) {
                                finish(false, 'max-bytes');
                                return;
                            }

                            pump();
                        })["catch"](function (error) {
                            finish(false, error && error.message || 'reader-error');
                        });
                    }

                    pump();
                })["catch"](function (error) {
                    if (settled) return;
                    RadioDebug.log('track.icy.fetch.error', {
                        error: error && error.message || 'request',
                        _quiet: true
                    });
                    startXhr();
                });
            }

            timer = setTimeout(function () {
                finish(false, 'timeout');
            }, ICY_META_TIMEOUT);

            startFetch();
        }

        function cloneTrack(track, image) {
            return {
                id: track && track.id,
                artist: track && track.artist || '',
                song: track && track.song || '',
                image: image || track && track.image || '',
                shareUrl: track && track.shareUrl || ''
            };
        }

        function fetchArtwork(track, done) {
            var key;
            var url;
            var mark;

            done = done || function () {};

            if (!track || !track.artist || !track.song || !window.fetch) {
                done(track);
                return;
            }

            key = (track.artist + '|' + track.song).toLowerCase();
            if (Object.prototype.hasOwnProperty.call(artworkCache, key)) {
                done(cloneTrack(track, artworkCache[key]));
                return;
            }

            url = 'https://itunes.apple.com/search?term=' +
                encodeURIComponent(track.artist + ' ' + track.song) +
                '&media=music&entity=song&limit=1&country=ru';
            mark = RadioDebug.measure('track.artwork', {
                artist: track.artist,
                song: track.song
            });
            RadioDebug.log('track.artwork.request', {
                artist: track.artist,
                song: track.song
            });

            fetch(url, {
                cache: 'force-cache'
            }).then(function (response) {
                if (!response || !response.ok) throw response;
                return response.json();
            }).then(function (data) {
                var result = data && data.results && data.results[0] || {};
                var image = upgradeArtwork(result.artworkUrl100 || result.artworkUrl60 || '');

                artworkCache[key] = image || '';
                RadioDebug.end(mark, 'track.artwork.response', {
                    image: image ? 'yes' : 'no'
                });
                done(cloneTrack(track, image));
            })["catch"](function (error) {
                artworkCache[key] = '';
                RadioDebug.end(mark, 'track.artwork.error', {
                    error: error && (error.statusText || error.message) || 'request'
                });
                done(track);
            });
        }

        function setTrackWithArtwork(track) {
            var key = stationKey(currentStation);

            if (!track) return;

            setTrack(track);
            fetchArtwork(track, function (nextTrack) {
                if (manualStop || key !== stationKey(currentStation)) return;
                if (nextTrack && nextTrack.image) setTrack(nextTrack);
            });
        }

        function fetchTrackFallback(done, fail) {
            var key = stationKey(currentStation);

            done = done || function () {};
            fail = fail || function () {};

            if (icyTrackBusy) {
                fail('busy');
                return;
            }

            icyTrackBusy = true;
            fetchIcyTrack(function (track) {
                icyTrackBusy = false;

                if (manualStop || key !== stationKey(currentStation)) {
                    fail('stale');
                    return;
                }

                setTrackWithArtwork(track);
                done(track);
            }, function (reason) {
                icyTrackBusy = false;
                fail(reason);
            });
        }

        function noteTrackApiFailure(reason) {
            var delay;

            nowFailCount++;

            if (nowFailCount < TRACK_API_BACKOFF_THRESHOLD) return;

            delay = Math.min(TRACK_API_BACKOFF_MAX, TRACK_API_BACKOFF_INTERVAL + Math.max(0, nowFailCount - TRACK_API_BACKOFF_THRESHOLD) * 30000);
            nowDisabledUntil = Date.now() + delay;

            RadioDebug.log('track.api.backoff', {
                fails: nowFailCount,
                delay: RadioDebug.ms(delay),
                reason: reason || 'api-error'
            });
        }

        function setTrackFromCache() {
            var item = findNowItem();

            if (item && item.track) {
                setTrack(item.track);
                return true;
            }

            return false;
        }

        function clearTrackPoll(cancelRequest) {
            clearTimeout(trackTimer);
            trackTimer = false;

            if (cancelRequest && trackRequest && typeof trackRequest.clear === 'function') {
                nowCallbacks = [];
                nowRequestBusy = false;
                nowRequestId++;

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

            function fallback(reason) {
                fetchTrackFallback(function () {
                    scheduleTrackPoll(TRACK_FALLBACK_POLL_INTERVAL);
                }, function (fallbackReason) {
                    if (fallbackReason === 'busy') {
                        RadioDebug.log('track.fallback.busy', {
                            _quiet: true
                        });
                        scheduleTrackPoll(TRACK_FALLBACK_POLL_INTERVAL);
                        return;
                    }

                    RadioDebug.log('track.fallback.error', {
                        reason: fallbackReason || reason || 'unknown'
                    });
                    scheduleTrackPoll(Math.min(TRACK_API_BACKOFF_MAX, TRACK_API_BACKOFF_INTERVAL));
                });
            }

            function done(data) {
                var item = findNowItem(data);

                if (item && item.track) {
                    setTrack(item.track);
                    scheduleTrackPoll(TRACK_POLL_INTERVAL);
                    return;
                }

                fallback('now-empty');
            }

            function fail(reason) {
                noteTrackApiFailure(reason);
                fallback(reason || 'api-error');
            }

            if (nowDisabledUntil > Date.now()) {
                RadioDebug.log('track.api.skip', {
                    delay: RadioDebug.ms(nowDisabledUntil - Date.now()),
                    fails: nowFailCount,
                    _quiet: true
                });
                fallback('api-backoff');
                return;
            }

            fetchNow(done, fail);
        }

        function clearStartupTimer() {
            clearTimeout(startTimer);
            startTimer = false;
        }

        function clearReconnect() {
            clearTimeout(reconnectTimer);
            reconnectTimer = false;
        }

        function isAbortPlayError(error) {
            var name = String(error && error.name || '').toLowerCase();
            var message = String(error && error.message || '').toLowerCase();

            return name.indexOf('abort') > -1 ||
                message.indexOf('interrupted') > -1 ||
                message.indexOf('pause') > -1 ||
                message.indexOf('load request') > -1;
        }

        function start(requestId) {
            var promise;

            if (manualStop || requestId !== playRequestId) return;

            RadioDebug.log('audio.play.call', {
                station: currentStation && currentStation.title,
                candidate: urlIndex + 1,
                request: requestId
            });

            try {
                promise = audio.play();
            } catch (e) {
                RadioDebug.log('audio.play.throw', {
                    message: e && e.message
                });
                if (!isAbortPlayError(e)) scheduleReconnect('play-throw');
                return;
            }

            if (promise && promise.then) {
                promise.then(function () {
                    if (manualStop || requestId !== playRequestId) return;
                    RadioDebug.log('audio.play.promise.ok', {
                        station: currentStation && currentStation.title,
                        request: requestId
                    });
                })["catch"](function (e) {
                    if (requestId !== playRequestId) {
                        RadioDebug.log('audio.play.promise.stale', {
                            message: e && e.message,
                            request: requestId,
                            active: playRequestId,
                            _local: true,
                            _quiet: true
                        });
                        return;
                    }

                    if (isAbortPlayError(e)) {
                        RadioDebug.log('audio.play.promise.abort', {
                            message: e && e.message,
                            request: requestId
                        });
                        return;
                    }

                    RadioDebug.log('audio.play.promise.error', {
                        message: e && e.message,
                        request: requestId
                    });
                    scheduleReconnect('play-promise');
                });
            }
        }

        function loadNative(requestId) {
            if (manualStop || requestId !== playRequestId) return;

            RadioDebug.log('audio.src.set', {
                station: currentStation && currentStation.title,
                candidate: urlIndex + 1,
                type: url.indexOf('.m3u8') > -1 ? 'hls' : 'aac',
                request: requestId
            });
            audio.src = url;
            try {
                RadioDebug.log('audio.load.call', {
                    station: currentStation && currentStation.title,
                    request: requestId
                });
                audio.load();
            } catch (e) {}
            start(requestId);
        }

        function cleanupMedia(flushAudio) {
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
            if (flushAudio !== false) {
                try {
                    audio.load();
                } catch (e3) {}
            }
        }

        function scheduleReconnect(reason) {
            var maxAttempts = Math.max(0, urlCandidates.length - 1);
            var retryDelay;

            if (manualStop || !urlCandidates.length || reconnectTimer) return;

            if (reconnectAttempts >= maxAttempts) {
                reconnectCycles++;
                reconnectAttempts = 0;
                urlIndex = 0;
                url = urlCandidates[0] || '';
                played = false;
                loading = true;
                updateControls();
                retryDelay = Math.min(STREAM_RETRY_MAX_DELAY, STREAM_RETRY_DELAY * reconnectCycles);
                RadioDebug.log('stream.reconnect.retry', {
                    station: currentStation && currentStation.title,
                    reason: reason || 'unknown',
                    delay: RadioDebug.ms(retryDelay),
                    cycle: reconnectCycles,
                    total: urlCandidates.length
                });
                reconnectTimer = setTimeout(function () {
                    reconnectTimer = false;
                    if (manualStop || !urlCandidates.length) return;
                    startCurrent('retry-' + (reason || 'fallback'));
                }, retryDelay);
                return;
            }

            reconnectAttempts++;
            loading = true;
            updateControls();
            RadioDebug.log('stream.fallback.wait', {
                station: currentStation && currentStation.title,
                reason: reason || 'unknown',
                candidate: urlIndex + 1,
                total: urlCandidates.length,
                attempt: reconnectAttempts
            });

            reconnectTimer = setTimeout(function () {
                reconnectTimer = false;
                if (manualStop || !urlCandidates.length) return;
                if (urlCandidates.length > 1) urlIndex = Math.min(urlIndex + 1, urlCandidates.length - 1);
                url = urlCandidates[urlIndex];
                RadioDebug.log('stream.fallback.next', {
                    station: currentStation && currentStation.title,
                    reason: reason || 'unknown',
                    candidate: urlIndex + 1,
                    total: urlCandidates.length
                });
                startCurrent(reason || 'fallback');
            }, 200);
        }

        function prepare(requestId) {
            var isHls = url.indexOf('.m3u8') > -1;
            var canNativeHls = audio.canPlayType && audio.canPlayType('audio/vnd.apple.mpegurl');
            var canHlsJs = typeof Hls !== 'undefined' && Hls && typeof Hls.isSupported === 'function' && Hls.isSupported();

            if (!isHls || canNativeHls || !canHlsJs) {
                loadNative(requestId);
                return;
            }

            try {
                if (manualStop || requestId !== playRequestId) return;

                RadioDebug.log('hls.load.source', {
                    station: currentStation && currentStation.title,
                    candidate: urlIndex + 1,
                    request: requestId
                });
                hls = new Hls();
                hls.attachMedia(audio);
                hls.loadSource(url);
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (manualStop || requestId !== playRequestId) return;
                    if (data && data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
                        Lampa.Noty.show('Ошибка в загрузке потока');
                    }
                    if (data && data.fatal) scheduleReconnect('hls-error');
                });
                hls.on(Hls.Events.MANIFEST_LOADED, function () {
                    start(requestId);
                });
            } catch (e) {
                scheduleReconnect('hls-prepare');
            }
        }

        function startCurrent(reason) {
            var requestId;

            if (!url) return;

            requestId = ++playRequestId;
            cleanupMedia(false);
            manualStop = false;
            played = false;
            loading = true;
            updateControls();
            RadioDebug.log('stream.start', {
                station: currentStation && currentStation.title,
                candidate: urlIndex + 1,
                total: urlCandidates.length,
                type: url.indexOf('.m3u8') > -1 ? 'hls' : 'aac',
                request: requestId,
                reason: reason || 'select'
            });
            prepare(requestId);
            startTimer = setTimeout(function () {
                if (!manualStop && !played && requestId === playRequestId) {
                    RadioDebug.log('stream.start.slow', {
                        station: currentStation && currentStation.title,
                        timeout: RadioDebug.ms(STREAM_START_TIMEOUT),
                        request: requestId
                    });
                }
            }, STREAM_START_TIMEOUT);
        }

        function pausePlayback(cancelRequest, flushAudio) {
            if (played || loading || currentStation) {
                RadioDebug.log('stream.stop', {
                    station: currentStation && currentStation.title,
                    played: played,
                    loading: loading
                });
                RadioDebug.scheduleDocument('stream.stop', 500);
            }

            manualStop = true;
            playRequestId++;
            reconnectAttempts = 0;
            reconnectCycles = 0;
            played = false;
            loading = false;
            clearTrackPoll(cancelRequest !== false);
            cleanupMedia(flushAudio);
            updateControls();
        }

        html.on('hover:enter click', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            if (lockToggle()) return false;
            if (played || loading) pausePlayback(true, true);
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
            var key = stationKey(data);
            var now = Date.now();

            if (key && key === lastPlayKey && now - lastPlayAt < ACTION_LOCK_DELAY && sameStation(data) && (played || loading)) {
                RadioDebug.log('station.select.duplicate', {
                    station: data && data.title,
                    _local: true,
                    _quiet: true
                });
                return;
            }

            lastPlayKey = key;
            lastPlayAt = now;
            pausePlayback(false, false);

            currentStation = data || {};
            currentTrack = false;
            urlCandidates = streamCandidates(currentStation);
            urlIndex = 0;
            url = urlCandidates[0] || '';
            reconnectAttempts = 0;
            reconnectCycles = 0;
            RadioDebug.startSession('connect', {
                station: currentStation.title,
                candidates: urlCandidates.length,
                streamMode: streamMode(),
                firstType: url.indexOf('.m3u8') > -1 ? 'hls' : 'aac'
            });

            if (!url) {
                if (Lampa.Noty) Lampa.Noty.show('У станции нет ссылки на поток');
                RadioDebug.finishSession('stream.no-url', {
                    station: currentStation.title
                });
                currentStation = false;
                updateControls();
                return;
            }

            html.find('.home-radio-record-player__name').text(data.title || 'Radio Record');
            html.toggleClass('hide', false);
            updateControls();
            startCurrent();
            if (setTrackFromCache()) scheduleTrackPoll(TRACK_POLL_INTERVAL);
            else scheduleTrackPoll(0);
        };

        this.toggle = function () {
            if (lockToggle()) return;
            if (played || loading) pausePlayback(true, true);
            else if (url) {
                startCurrent();
                scheduleTrackPoll(0);
            }
        };

        this.stop = function (hide) {
            pausePlayback(true, true);
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

        this.prefetchTracks = function () {
            if (nowRequestBusy) return;
            if (nowDisabledUntil > Date.now()) return;
            if (nowCache && Date.now() - nowCacheTime < TRACK_POLL_INTERVAL) return;

            fetchNow(function () {
                if (currentStation) setTrackFromCache();
            }, function (reason) {
                noteTrackApiFailure(reason || 'prefetch-error');
            });
        };
    }

    function RadioComponent() {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true,
            step: 90
        });
        var player = window.home_radio_record_player;
        var items = [];
        var html = $('<div></div>');
        var panel = Lampa.Template.get('home_radio_record_panel', {});
        var panelActions = panel.find('.home-radio-record-panel__btn');
        var panelCover = panel.find('.home-radio-record-panel__cover');
        var panelImage = panel.find('.home-radio-record-panel__cover img');
        var panelDebug = panel.find('.home-radio-record-panel__debug');
        var body = $('<div class="category-full"></div>');
        var activity;
        var active;
        var focusArea = 'grid';
        var panelFocus = -1;
        var last;
        var playing = '';
        var keyBound = false;
        var lastNavTime = 0;
        var columnCountCache = 0;
        var columnWidthCache = 0;
        var panelBound = false;
        var playerStateOff = false;
        var debugStateOff = false;
        var debugTimer = false;
        var panelImageAt = 0;
        var stationsBuilt = false;
        var prefetchTimer = false;
        var iconObserver = false;
        var lastActionKey = '';
        var lastActionAt = 0;

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

        function clearGridFocus() {
            if (typeof active === 'number' && items && items[active]) {
                items[active].render().removeClass('focus hover radio-record-focus');
            }
        }

        function clearPanelFocus() {
            panelFocus = -1;
            panelActions.removeClass('focus hover radio-record-focus');
        }

        function focusPanel(index) {
            var button;

            if (!panelActions.length) return false;

            if (index < 0) index = 0;
            if (index >= panelActions.length) index = panelActions.length - 1;

            focusArea = 'panel';
            panelFocus = index;
            clearGridFocus();
            panelActions.removeClass('focus hover radio-record-focus');

            button = panelActions.eq(panelFocus);
            button.addClass('focus radio-record-focus');
            last = button[0];

            try {
                Lampa.Controller.collectionFocus(button, html);
            } catch (e) {}

            return true;
        }

        function triggerPanelAction(index) {
            var button;
            var action;

            if (typeof index === 'number') panelFocus = index;
            if (panelFocus < 0) panelFocus = 0;

            button = panelActions.eq(panelFocus);
            action = button.attr('data-action');

            if (action === 'close') {
                if (actionLocked('panel-close')) return true;
                closeRadio();
                return true;
            }

            if (action === 'toggle' && player && typeof player.toggle === 'function') {
                if (actionLocked('panel-toggle')) return true;
                player.toggle();
                return true;
            }

            return false;
        }

        function actionLocked(key) {
            var now = Date.now();

            if (key && lastActionKey === key && now - lastActionAt < ACTION_LOCK_DELAY) {
                RadioDebug.log('action.duplicate', {
                    action: key,
                    _local: true,
                    _quiet: true
                });
                return true;
            }

            lastActionKey = key;
            lastActionAt = now;
            return false;
        }

        function panelMeta(textClass, value) {
            panel.find(textClass).text(value || '');
        }

        function updatePanel(state) {
            var station = state && state.station;
            var track = state && state.track;
            var title = station && station.title || 'Radio Record';
            var song = track && track.song || (station ? (state.loading ? 'Подключаю поток' : 'Прямой эфир') : 'Выберите станцию');
            var artist = track && track.artist || (station ? 'Radio Record' : 'Все каналы Radio Record');
            var image = track && track.image || station && station.icon || '';
            var imageIsIcon = !(track && track.image);

            panel.toggleClass('is-playing', !!(state && state.played));
            panel.toggleClass('is-loading', !!(state && state.loading));
            panel.data('fallback-icon', station && station.icon || '');
            panelMeta('.home-radio-record-panel__station', title);
            panelMeta('.home-radio-record-panel__track', song);
            panelMeta('.home-radio-record-panel__artist', artist);
            panelCover.toggleClass('is-icon', imageIsIcon);

            if (image && panelImage.attr('src') !== image) {
                panelImageAt = RadioDebug.now();
                RadioDebug.log(imageIsIcon ? 'panel.icon.request' : 'track.image.request', {
                    station: title,
                    image: imageIsIcon ? 'station' : 'track'
                });
                panelImage.attr('src', image);
            }
            else if (!image) panelImage.removeAttr('src');

            if (state && state.station && (state.played || state.loading)) markPlaying(state.station);
            else if (!state || !state.station || (!state.played && !state.loading)) markPlaying(false);
        }

        function bindPanelActions() {
            if (panelBound) return;
            panelBound = true;

            panelActions.on('hover:focus', function () {
                focusPanel(panelActions.index(this));
            }).on('hover:enter click', function (e) {
                if (e && e.preventDefault) e.preventDefault();
                focusPanel(panelActions.index(this));
                triggerPanelAction();
            });

            panelImage.on('load', function () {
                RadioDebug.log(panelCover.hasClass('is-icon') ? 'panel.icon.loaded' : 'track.image.loaded', {
                    ms: RadioDebug.ms(RadioDebug.since(panelImageAt))
                });
            });

            panelImage.on('error', function () {
                var fallback = panel.data('fallback-icon');

                RadioDebug.log(panelCover.hasClass('is-icon') ? 'panel.icon.error' : 'track.image.error', {
                    ms: RadioDebug.ms(RadioDebug.since(panelImageAt))
                });

                if (fallback && panelImage.attr('src') !== fallback) {
                    panelCover.addClass('is-icon');
                    panelImage.attr('src', fallback);
                }
            });
        }

        function attachPlayerState() {
            if (playerStateOff || !player || typeof player.onState !== 'function') return;
            playerStateOff = player.onState(updatePanel);
        }

        function updateDebugStatus() {
            if (!panelDebug.length) return;

            panelDebug.text(RadioDebug.statusText());
        }

        function attachDebugStatus() {
            if (debugStateOff) return;
            if (!panelDebug.length || panelDebug.css('display') === 'none') return;

            debugStateOff = RadioDebug.onStatus(updateDebugStatus);
            debugTimer = setInterval(updateDebugStatus, 1000);
        }

        function detachDebugStatus() {
            clearInterval(debugTimer);
            debugTimer = false;

            if (debugStateOff) {
                debugStateOff();
                debugStateOff = false;
            }
        }

        function setFocus(index) {
            var item;
            var itemHtml;
            var previous = active;
            var columns = getColumnCount();
            var previousRow;
            var nextRow;

            if (!items || !items.length) return false;

            if (index < 0) index = 0;
            if (index >= items.length) index = items.length - 1;

            if (focusArea === 'grid' && active === index && items[active]) {
                itemHtml = items[active].render();
                itemHtml.addClass('focus radio-record-focus');
                last = itemHtml[0];
                return true;
            }

            active = index;
            focusArea = 'grid';
            clearPanelFocus();
            loadIconsAround(active);
            item = items[active];
            itemHtml = item.render();
            last = itemHtml[0];

            if (typeof previous === 'number' && items[previous]) items[previous].render().removeClass('focus hover radio-record-focus');
            itemHtml.addClass('focus radio-record-focus');
            previousRow = typeof previous === 'number' ? Math.floor(previous / columns) : -1;
            nextRow = Math.floor(active / columns);
            if (previousRow !== nextRow) scroll.update(itemHtml, true);

            try {
                Lampa.Controller.collectionFocus(itemHtml, html);
            } catch (e) {}

            return true;
        }

        function canNavigate() {
            var now = Date.now();

            if (!NAVIGATION_DELAY) return true;
            if (now - lastNavTime < NAVIGATION_DELAY) return false;

            lastNavTime = now;
            return true;
        }

        function loadIcon(index) {
            if (items && items[index] && items[index].load) items[index].load();
        }

        function loadIconsAround(index) {
            var start = Math.max(0, index - 2);
            var end = Math.min(items.length - 1, index + 8);
            var i;

            for (i = start; i <= end; i++) {
                loadIcon(i);
            }
        }

        function setupIconObserver() {
            if (iconObserver !== false) return;

            if (!window.IntersectionObserver) {
                iconObserver = null;
                return;
            }

            iconObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var stationItem;

                    if (!entry || !entry.isIntersecting) return;

                    stationItem = $(entry.target).data('radio-record-item');
                    if (stationItem && stationItem.load) stationItem.load();

                    try {
                        iconObserver.unobserve(entry.target);
                    } catch (e) {}
                });
            }, {
                root: null,
                rootMargin: '180px 0px',
                threshold: 0.01
            });
        }

        function observeIcon(stationItem) {
            var itemHtml;

            if (!stationItem || !stationItem.render) return;

            setupIconObserver();
            itemHtml = stationItem.render();
            itemHtml.data('radio-record-item', stationItem);

            if (iconObserver && itemHtml[0]) {
                try {
                    iconObserver.observe(itemHtml[0]);
                } catch (e) {
                    stationItem.load();
                }
            }
        }

        function disconnectIconObserver() {
            if (iconObserver && iconObserver.disconnect) {
                try {
                    iconObserver.disconnect();
                } catch (e) {}
            }

            iconObserver = false;
        }

        function scheduleTrackPrefetch() {
            clearTimeout(prefetchTimer);
            prefetchTimer = setTimeout(function () {
                prefetchTimer = false;
                if (player && typeof player.prefetchTracks === 'function') player.prefetchTracks();
            }, 700);
        }

        function getColumnCount() {
            var first;
            var firstTop;
            var count = 0;
            var i;
            var width = window.innerWidth || 0;

            if (!items || !items.length) return 1;
            if (columnCountCache && columnWidthCache === width) return columnCountCache;

            first = items[0].render()[0];
            if (!first) return 1;

            firstTop = first.offsetTop;

            for (i = 0; i < items.length; i++) {
                if (!items[i].render()[0] || Math.abs(items[i].render()[0].offsetTop - firstTop) > 4) break;
                count++;
            }

            columnCountCache = Math.max(1, count);
            columnWidthCache = width;

            return columnCountCache;
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

            if (focusArea === 'panel') return triggerPanelAction();

            if (typeof active !== 'number') active = 0;
            item = items[active];

            if (item && item.data) {
                if (actionLocked('station-' + stationKey(item.data))) return true;
                RadioDebug.log('station.select', {
                    station: item.data.title,
                    index: active,
                    source: 'joystick'
                });
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
            var key = stationKey(station);

            if (playing === key) return;

            playing = key;

            items.forEach(function (item) {
                if (item.setPlaying) item.setPlaying(stationKey(item.data) === playing);
                else item.render().toggleClass('playing', stationKey(item.data) === playing);
            });
        }

        function leaveContent(target) {
            unbindKeys();
            if (Lampa.Controller) Lampa.Controller.toggle(target);
        }

        function movePanel(direction) {
            if (focusArea !== 'panel') return false;

            if (direction === 'left') {
                focusPanel(Math.max(0, panelFocus - 1));
                return true;
            }

            if (direction === 'right') {
                focusPanel(Math.min(panelActions.length - 1, panelFocus + 1));
                return true;
            }

            if (direction === 'down') {
                setFocus(typeof active === 'number' ? active : 0);
                return true;
            }

            if (direction === 'up') {
                leaveContent('head');
                return true;
            }

            return false;
        }

        function moveOrLeave(direction) {
            if (!canNavigate()) return;
            if (movePanel(direction)) return;
            if (moveFocus(direction)) return;
            if (direction === 'left') leaveContent('menu');
            else if (direction === 'up') focusPanel(0);
        }

        function keyName(code) {
            if (code === 37 || code === 21) return 'left';
            if (code === 39 || code === 22) return 'right';
            if (code === 38 || code === 19) return 'up';
            if (code === 40 || code === 20) return 'down';
            if (code === 13 || code === 23 || code === 66) return 'enter';
            if (code === 4 || code === 8 || code === 27 || code === 461 || code === 10009) return 'back';

            return 'key-' + code;
        }

        function keyMark(code) {
            return RadioDebug.measure('joystick.' + keyName(code), {
                code: code,
                area: focusArea,
                active: active
            });
        }

        function keyDone(mark) {
            RadioDebug.end(mark, 'joystick.response', {
                area: focusArea,
                active: active,
                panel: panelFocus,
                _quiet: true
            });
        }

        function bindKeys() {
            if (keyBound) return;
            keyBound = true;

            $(document).on(KEY_NAMESPACE, function (e) {
                var code;

                if (!isActiveActivity()) return;

                code = e.keyCode || e.which;

                if (code === 37 || code === 21) {
                    var markLeft = keyMark(code);
                    stopEvent(e);
                    moveOrLeave('left');
                    keyDone(markLeft);
                    return false;
                }

                if (code === 39 || code === 22) {
                    var markRight = keyMark(code);
                    stopEvent(e);
                    moveOrLeave('right');
                    keyDone(markRight);
                    return false;
                }

                if (code === 38 || code === 19) {
                    var markUp = keyMark(code);
                    stopEvent(e);
                    moveOrLeave('up');
                    keyDone(markUp);
                    return false;
                }

                if (code === 40 || code === 20) {
                    var markDown = keyMark(code);
                    stopEvent(e);
                    moveOrLeave('down');
                    keyDone(markDown);
                    return false;
                }

                if (code === 13 || code === 23 || code === 66) {
                    var markEnter = keyMark(code);
                    stopEvent(e);
                    playFocused();
                    keyDone(markEnter);
                    return false;
                }

                if (code === 4 || code === 8 || code === 27 || code === 461 || code === 10009) {
                    var markBack = keyMark(code);
                    stopEvent(e);
                    closeRadio();
                    keyDone(markBack);
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
            markPlaying(false);
            clearPanelFocus();
            if (player && player.stop) player.stop(hide);
        }

        function closeRadio() {
            stopRadio(true);
            try {
                Lampa.Activity.backward();
            } catch (e) {}
        }

        this.create = function () {
            if (!panel.parent().length) html.append(panel);
            bindPanelActions();
            attachPlayerState();
            attachDebugStatus();
            RadioDebug.log('component.create', {
                component: COMPONENT
            });
            this.activity.loader(true);
            this.loadStations();

            return this.render();
        };

        this.loadStations = function () {
            var that = this;
            var cache = readStationsCache();

            if (cache && cache.stations.length) {
                RadioDebug.log('stations.cache.hit', {
                    count: cache.stations.length,
                    key: cache.key,
                    stale: cache.stale ? 'yes' : 'no',
                    age: RadioDebug.ms(cache.age)
                });
                this.build(cache.stations, true);

                if (cache.key !== STATIONS_CACHE_KEY) writeStationsCache(cache.stations);
            }

            function showEmpty() {
                var empty = new Lampa.Empty();

                html.append(empty.render());
                that.start = function () {
                    return empty.start.apply(empty, arguments);
                };
                that.activity.loader(false);
                that.activity.toggle();
            }

            function loadSource(sourceIndex) {
                var source = STATIONS_SOURCES[sourceIndex];

                if (!source) {
                    if (!stationsBuilt) showEmpty();
                    return;
                }

                RadioDebug.log(sourceIndex ? 'stations.fallback.request' : 'stations.request', {
                    source: source.name,
                    cached: stationsBuilt ? 'yes' : 'no'
                });

                network["native"](source.url, function (data) {
                    var stations = parseStations(data);

                    if (stations.length < STATIONS_MIN_COUNT) {
                        RadioDebug.log('stations.source.too-small', {
                            source: source.name,
                            count: stations.length,
                            min: STATIONS_MIN_COUNT
                        });
                        loadSource(sourceIndex + 1);
                        return;
                    }

                    writeStationsCache(stations);

                    if (!stationsBuilt) that.build(stations, false, source.name);
                    else {
                        RadioDebug.log('stations.refresh.done', {
                            count: stations.length,
                            source: source.name
                        });
                        scheduleTrackPrefetch();
                    }

                    if (sourceIndex) RadioDebug.scheduleDocument('stations.fallback.used', 800);
                }, function (xhr, status, error) {
                    var errorData = requestErrorData(xhr, status, error);

                    errorData.source = source.name;
                    errorData.url = source.url;
                    errorData.cached = stationsBuilt ? 'yes' : 'no';
                    RadioDebug.log('stations.source.error', errorData);

                    if (sourceIndex + 1 < STATIONS_SOURCES.length) {
                        RadioDebug.log('stations.fallback.next', {
                            from: source.name,
                            to: STATIONS_SOURCES[sourceIndex + 1].name,
                            cached: stationsBuilt ? 'yes' : 'no'
                        });
                        loadSource(sourceIndex + 1);
                        return;
                    }

                    errorData._message = true;
                    RadioDebug.log(stationsBuilt ? 'stations.refresh.error' : 'stations.load.error', errorData);
                    RadioDebug.scheduleDocument(stationsBuilt ? 'stations.refresh.error' : 'stations.load.error', 500);

                    if (!stationsBuilt) showEmpty();
                });
            }

            loadSource(0);
        };

        this.build = function (data, fromCache, sourceName) {
            var stations = parseStations(data);

            if (stationsBuilt) return;

            stationsBuilt = true;
            RadioDebug.log('stations.loaded', {
                count: stations.length,
                source: fromCache ? 'cache' : sourceName || 'network'
            });
            scroll.minus();
            this.append(stations);
            scroll.append(body);
            html.append(scroll.render());
            this.activity.loader(false);
            this.activity.toggle();
            scheduleTrackPrefetch();
        };

        this.append = function (stations) {
            columnCountCache = 0;

            stations.forEach(function (station) {
                var stationItem = new StationItem(station);

                stationItem.render().on('hover:focus', function () {
                    setFocus(items.indexOf(stationItem));
                }).on('hover:enter click', function (e) {
                    if (e && e.preventDefault) e.preventDefault();
                    setFocus(items.indexOf(stationItem));
                    if (actionLocked('station-' + stationKey(station))) return false;
                    RadioDebug.log('station.select', {
                        station: station.title,
                        index: items.indexOf(stationItem),
                        source: e && e.type || 'click'
                    });
                    markPlaying(station);
                    player.play(station);
                    return false;
                });

                body.append(stationItem.render());
                items.push(stationItem);
                observeIcon(stationItem);
            });

            if (items.length && typeof active !== 'number') {
                active = 0;
                last = items[0].render()[0];
                items[0].render().addClass('focus radio-record-focus');
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
                    Lampa.Controller.collectionSet(html);
                    bindKeys();
                    if (items && items.length) setFocus(typeof active === 'number' ? active : 0);
                    else Lampa.Controller.collectionFocus(last || false, html);
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

        this.pause = function () {
            if (isActiveActivity()) unbindKeys();
            else stopRadio(true);
        };
        this.stop = function () {
            stopRadio(true);
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            stopRadio(true);
            disconnectIconObserver();
            clearTimeout(prefetchTimer);
            if (playerStateOff) {
                playerStateOff();
                playerStateOff = false;
            }
            detachDebugStatus();
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

        Lampa.Template.add('home_radio_record_panel', '<div class="home-radio-record-panel">' +
            '<div class="home-radio-record-panel__cover is-icon">' +
                '<img />' +
            '</div>' +
            '<div class="home-radio-record-panel__meta">' +
                '<div class="home-radio-record-panel__station">Radio Record</div>' +
                '<div class="home-radio-record-panel__track">Выберите станцию</div>' +
                '<div class="home-radio-record-panel__artist">Все каналы Radio Record</div>' +
                '<div class="home-radio-record-panel__debug">diag ready</div>' +
            '</div>' +
            '<div class="home-radio-record-panel__actions">' +
                '<div class="selector home-radio-record-panel__btn home-radio-record-panel__toggle" data-action="toggle"></div>' +
                '<div class="selector home-radio-record-panel__btn home-radio-record-panel__close" data-action="close"></div>' +
            '</div>' +
        '</div>');

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
