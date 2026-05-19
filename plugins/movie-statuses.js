/*
 * Статусы фильмов и сериалов
 * author: shardice
 * version: 1.0.3
 * description: Добавляет локальные пользовательские статусы для фильмов и сериалов
 */
(function(){'use strict';
var STORAGE_KEY='shardice_movie_statuses_v1';
var STATUSES=[{id:'watching',title:'Смотрю'},{id:'planned',title:'Буду смотреть'},{id:'watched',title:'Просмотрено'},{id:'paused',title:'Отложено'},{id:'dropped',title:'Брошено'}];
Lampa.Lang.add({shardice_status_button:{ru:'Статус',en:'Status',uk:'Статус'},shardice_statuses_menu:{ru:'Мои статусы',en:'My statuses',uk:'Мої статуси'}});
function getAll(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{};}catch(e){return {};}}
function setAll(d){localStorage.setItem(STORAGE_KEY,JSON.stringify(d||{}));}
function movieId(m){if(!m)return'';return String(m.id||m.tmdb_id||m.imdb_id||m.original_title||m.name||'');}
function movieTitle(m){return m.title||m.name||m.original_title||m.original_name||'Без названия';}
function saveStatus(movie,status){var id=movieId(movie);if(!id)return;var data=getAll();data[id]={id:id,status:status.id,status_title:status.title,title:movieTitle(movie),year:movie.release_date?String(movie.release_date).slice(0,4):(movie.first_air_date?String(movie.first_air_date).slice(0,4):''),poster:movie.poster_path||'',saved_at:Date.now()};setAll(data);if(Lampa.Noty)Lampa.Noty.show('Статус: '+status.title);}
function openStatusSelect(movie){var items=STATUSES.map(function(s){return{title:s.title,subtitle:'Сохранить как "'+s.title+'"',status:s};});items.push({title:'Убрать статус',subtitle:'Удалить из моих статусов',remove:true});Lampa.Select.show({title:'Выберите статус',items:items,onSelect:function(item){var id=movieId(movie),data=getAll();if(item.remove){if(id&&data[id]){delete data[id];setAll(data);}if(Lampa.Noty)Lampa.Noty.show('Статус удалён');}else saveStatus(movie,item.status);}});}
function addButton(e){try{var movie=e.data&&e.data.movie?e.data.movie:e.data;if(!movie)return;var body=e.object&&e.object.activity&&e.object.activity.render?e.object.activity.render():$('.full-start__buttons, .full-start-new__buttons').first();if(!body||!body.length)return;if(body.find('[data-shardice-status-button]').length)return;var button=$('<div class="full-start__button selector" data-shardice-status-button="true"><span>'+Lampa.Lang.translate('shardice_status_button')+'</span></div>');button.on('hover:enter',function(){openStatusSelect(movie);});body.append(button);}catch(err){console.log('Shardice statuses button error:',err);}}
function addSettingsButton(){if(!Lampa.Settings||!Lampa.Settings.main)return;var main=Lampa.Settings.main(),render=main.render();if(render.find('[data-component="shardice_statuses"]').length)return;var field=$('<div class="settings-param selector" data-component="shardice_statuses"><div class="settings-param__name">'+Lampa.Lang.translate('shardice_statuses_menu')+'</div><div class="settings-param__descr">Список сохранённых фильмов по статусам</div></div>');render.find('[data-component="shardice_store"], [data-component="more"]').first().after(field);main.update();}
function openSavedList(){var data=getAll();var items=Object.keys(data).map(function(k){var i=data[k];return{title:i.title,subtitle:i.status_title+(i.year?' • '+i.year:'')};});if(!items.length)items.push({title:'Пока пусто',subtitle:'Откройте карточку фильма и назначьте статус'});Lampa.Select.show({title:'Мои статусы',items:items,onSelect:function(){}});}
if(Lampa.Listener)Lampa.Listener.follow('full',function(e){if(e.type=='complite'||e.type=='complete')addButton(e);});
Lampa.Settings.listener.follow('open',function(e){if(e.name=='main'){addSettingsButton();e.body.find('[data-component="shardice_statuses"]').off('hover:enter').on('hover:enter',function(){openSavedList();});}});
if(window.appready)addSettingsButton();else Lampa.Listener.follow('app',function(e){if(e.type=='ready')addSettingsButton();});
})();
