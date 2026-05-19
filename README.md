# lampa-store-clean-v1

Чистый старт.

Что внутри:
- store.js — красивый магазин с тем дизайном, но установка открывает родной экран Lampa для подтверждения.
- extensions.json — пока только один первый плагин: Reload Lampa Button.
- catalog/reload-button.json — одиночный каталог для родной установки Lampa.
- plugins/reload-button.js — лёгкая кнопка перезагрузки без постоянного setInterval.
- covers/reload-button.svg — чистый cover без текста.

Порядок проверки:
1. Удалить старые store.js?v=... из Lampa.
2. Загрузить файлы на GitHub.
3. Установить: https://shardice.github.io/lampa-store/store.js
4. Открыть Дом плагинов.
5. Навигация: стрелки/джойстик/мышь.
6. OK на карточке Reload Button открывает родной экран Lampa для установки.
