# Дом плагинов v1.8.0

Что изменено:

1. Установка теперь не подгружает JS вручную.
   Кнопка "Установить" пытается вызвать системные методы Lampa.Extensions:
   - install
   - add
   - addPlugin
   - append

   Если сборка Lampa не даёт такого API, открывается системный список Lampa.
   Это нужно, чтобы подтверждение установки/перезагрузки показывала именно Lampa.

2. Добавлены реальные кнопки на карточках:
   - Установить
   - Удалить

3. Добавлена папка covers:
   - covers/record-radio.svg
   - covers/reload-button.svg
   - covers/movie-statuses.svg
   - covers/plugin-home.svg
   - covers/coming-soon.svg

4. extensions.json теперь поддерживает поле cover:
   "cover": "record-radio.svg"

5. Добавлено управление стрелками/джойстиком:
   - Left / Right
   - Up / Down
   - Enter / OK
   - Back / Escape

6. Закрытие возвращает в настройки, а не в старую страницу расширений.

Публичные ссылки после загрузки:
- https://shardice.github.io/lampa-store/store.js?v=180
- https://shardice.github.io/lampa-store/extensions.json?v=180
