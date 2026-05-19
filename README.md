# Lampa Store v20 safe reset

Кнопка Reload Button удалена из каталога, потому что она грузила систему и вставала поверх часов.

Порядок восстановления:
1. Загрузить файлы на GitHub.
2. В Lampa установить и запустить:
   https://shardice.github.io/lampa-store/reset-shardice.js
3. После перезагрузки установить:
   https://shardice.github.io/lampa-store/store.js

Новый store.js:
- без кастомной страницы;
- без colStep;
- без plugin-card;
- без reload-кнопки;
- только Lampa.Extensions.show.
