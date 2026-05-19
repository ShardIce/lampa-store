
/* name: Клубничка
 * author: shardice
 * version: 1.0.0
 */
(function(){'use strict';function open(){Lampa.Select.show({title:'Клубничка 18+',items:[{title:'Источники не настроены',subtitle:'Добавь источники в strawberry-sources.json'}],onSelect:function(){if(Lampa.Noty)Lampa.Noty.show('Нужны источники для каталога')}})}function boot(){if(Lampa.Noty)Lampa.Noty.show('Клубничка установлена. Добавь источники.');window.PluginHomeStrawberry=open}if(window.appready)boot();else Lampa.Listener.follow('app',function(e){if(e.type=='ready')boot()})})();
