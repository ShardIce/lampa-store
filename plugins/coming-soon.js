/*
 * Скоро
 * author: shardice
 * version: 1.0.0
 * description: Заглушка для будущих плагинов Shardice Store
 */
(function(){'use strict';if(window.appready){if(Lampa.Noty)Lampa.Noty.show('Этот плагин пока в разработке');}else Lampa.Listener.follow('app',function(e){if(e.type=='ready'&&Lampa.Noty)Lampa.Noty.show('Этот плагин пока в разработке');});})();
