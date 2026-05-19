
/* name: Очистка старых версий Дом плагинов
 * author: shardice
 * version: 2.0.0
 */
(function(){'use strict';var host='shardice.github.io/lampa-store';var removed=0;try{for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i),v=localStorage.getItem(k);if(v&&v.indexOf(host)>-1&&(v.indexOf('colStep')>-1||v.indexOf('plugin-card')>-1||v.indexOf('plugin-home__scroll')>-1||v.indexOf('store.js?v=')>-1)){localStorage.removeItem(k);removed++}}if(Lampa.Noty)Lampa.Noty.show('Удалено старых записей: '+removed);setTimeout(function(){try{if(Lampa.Utils&&Lampa.Utils.reload){Lampa.Utils.reload();return}}catch(e){}location.reload()},1200)}catch(e){if(Lampa.Noty)Lampa.Noty.show('Ошибка очистки')}})();
