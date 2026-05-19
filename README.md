# Lampa Store v19

Главное:
1. cleanup-store.js удаляет из localStorage старые битые версии магазина с colStep.
2. store.js больше не содержит кастомной страницы, прокрутки, colStep.
3. Дом плагинов открывает родной экран Lampa.Extensions.show.
4. Radio Record теперь добавляет пункт в меню и открывает простой список станций.

Как восстановить:
1. Загрузить все файлы на GitHub.
2. В Lampa добавить:
   https://shardice.github.io/lampa-store/cleanup-store.js
3. Подождать перезагрузку.
4. В Lampa добавить:
   https://shardice.github.io/lampa-store/store.js

Проверка:
https://shardice.github.io/lampa-store/store.js
НЕ должен содержать colStep.
