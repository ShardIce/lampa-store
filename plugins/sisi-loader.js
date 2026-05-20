/*
 * name: SISI Loader
 * author: @bwa / xsena
 * version: 1.0.0
 * description: Loads SISI and xsena sources with local fallbacks.
 */

(function () {
    'use strict';

    if (window.home_sisi_loader_ready) return;
    window.home_sisi_loader_ready = true;

    var fallbackBase = 'https://shardice.github.io/lampa-store/plugins/vendor/sisi/';

    try {
        var current = document.currentScript && document.currentScript.src;
        if (current && current.indexOf('/plugins/') >= 0) {
            fallbackBase = current.replace(/plugins\/[^\/?#]+(?:[?#].*)?$/, 'plugins/vendor/sisi/');
        }
    } catch (e) {}

    var sources = [
        {
            remote: 'https://rc.bwa.ad/sisi.js?v23012026',
            fallback: fallbackBase + 'bwa-sisi.js',
            ready: 'plugin_bwasisi_bwasisi_ready'
        },
        {
            remote: 'https://cf.xsena.red?v14012026',
            fallback: fallbackBase + 'cf-xsena.js',
            ready: 'plugin_xsena_cfxsena_ready'
        },
        {
            remote: 'https://pl.xsena.red?v14012026',
            fallback: fallbackBase + 'pl-xsena.js',
            ready: 'plugin_xsena_plxsena_ready'
        }
    ];

    function loadScript(url, ready, success, fail) {
        var script = document.createElement('script');
        var finished = false;
        var timer = setTimeout(function () {
            done(false);
        }, 12000);

        function done(ok) {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            script.onload = null;
            script.onerror = null;

            if (ok) success();
            else {
                try {
                    if (script.parentNode) script.parentNode.removeChild(script);
                } catch (e) {}

                fail();
            }
        }

        script.async = true;
        script.src = url;
        script.onload = function () {
            setTimeout(function () {
                done(!ready || !!window[ready]);
            }, 80);
        };
        script.onerror = function () {
            done(false);
        };

        document.head.appendChild(script);
    }

    function loadSource(source) {
        if (source.ready && window[source.ready]) return;

        loadScript(source.remote, source.ready, function () {}, function () {
            loadScript(source.fallback, source.ready, function () {}, function () {
                console.log('SISI Loader', 'failed:', source.remote);
                if (Lampa.Noty) Lampa.Noty.show('Не удалось загрузить источник SISI');
            });
        });
    }

    sources.forEach(loadSource);
})();
