/*
 * Shardice Store
 * author: shardice
 * version: 1.0.3
 * description: Удобный каталог пользовательских плагинов для Lampa
 */
(function () {
    'use strict';
    var STORE_URL = 'https://shardice.github.io/lampa-store/extensions.json';
    Lampa.Lang.add({
        shardice_store_title: {ru:'Shardice Store', en:'Shardice Store', uk:'Shardice Store'},
        shardice_store_descr: {ru:'Красивый каталог плагинов и улучшений', en:'Plugin catalog and improvements', uk:'Каталог плагінів та покращень'}
    });
    function iconSvg(){return '<svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="34" height="34" rx="10" fill="rgba(0,255,200,.18)" stroke="rgba(0,255,200,.88)" stroke-width="2"/><path d="M13 21.5L18.2 26.7L29.5 15.4" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="31" cy="11" r="3" fill="#00ffd0"/></svg>';}
    function addStore(){
        if(!Lampa.Settings || !Lampa.Settings.main) return;
        var main=Lampa.Settings.main(), render=main.render();
        if(render.find('[data-component="shardice_store"]').length) return;
        var field=$('<div class="settings-param selector" data-component="shardice_store"><div class="settings-param__icon">'+iconSvg()+'</div><div class="settings-param__body"><div class="settings-param__name">'+Lampa.Lang.translate('shardice_store_title')+'</div><div class="settings-param__descr">'+Lampa.Lang.translate('shardice_store_descr')+'</div></div></div>');
        var more=render.find('[data-component="more"]');
        if(more.length) more.after(field); else render.append(field);
        main.update();
    }
    Lampa.Settings.listener.follow('open',function(e){
        if(e.name=='main'){
            e.body.find('[data-component="shardice_store"]').off('hover:enter').on('hover:enter',function(){
                Lampa.Extensions.show({store:STORE_URL, with_installed:true});
            });
        }
    });
    if(window.appready) addStore(); else Lampa.Listener.follow('app',function(e){if(e.type=='ready') addStore();});
})();
