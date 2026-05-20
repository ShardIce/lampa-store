(function(){
    'use strict';

    function patchSelectboxAutofocus() {
        if (window.custom_favs_selectbox_autofocus_patch) return;
        window.custom_favs_selectbox_autofocus_patch = true;

        var originalSetTimeout = window.setTimeout;

        window.setTimeout = function (handler, timeout) {
            try {
                if (timeout == 10 && typeof handler == 'function') {
                    var source = Function.prototype.toString.call(handler);

                    if (source.indexOf('body > .selectbox') >= 0 &&
                        source.indexOf('Lampa.Controller.focus') >= 0 &&
                        source.indexOf('Navigator.focus') >= 0) {
                        return originalSetTimeout(function () {}, timeout);
                    }
                }
            } catch (e) {}

            return originalSetTimeout.apply(this, arguments);
        };
    }

    function start() {
        var pluginUrl = Lampa.Manifest.app_digital >= 300
            ? 'https://levende.github.io/lampa-plugins/v3/custom-favs.js'
            : 'https://levende.github.io/lampa-plugins/v2/custom-favs.js';

        patchSelectboxAutofocus();
        Lampa.Utils.putScriptAsync([pluginUrl], function () { });
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function() {
            start();
        });
    }
})();
