# Дом плагинов v2.0.0

Главные исправления:
- Установка открывает родной экран Lampa.Extensions.show с отдельным каталогом на один плагин.
- Это нужно, чтобы подтверждение установки/перезагрузки показывала сама Lampa.
- Добавлена папка `covers` с PNG-обложками.
- `extensions.json` поддерживает поле `cover`.
- Для каждого плагина есть отдельный catalog/*.json.
- Управление стрелками исправлено: фокус и scrollTop ведутся вручную.
- Кнопки: Установить / Удалить на каждой карточке.

Проверочные ссылки после загрузки:
- https://shardice.github.io/lampa-store/store.js?v=190
- https://shardice.github.io/lampa-store/extensions.json?v=190
- https://shardice.github.io/lampa-store/covers/record-radio.png
- https://shardice.github.io/lampa-store/catalog/record-radio.json?v=130


## v2.0.0
- Уменьшен размер иконки "Дом плагинов" в настройках.
- Иконка приведена к размеру стандартных пунктов Lampa.
- Новая ссылка магазина: https://shardice.github.io/lampa-store/store.js?v=200

Важно:
Если Lampa показывает ошибку по `store.js?v=104`, значит в памяти всё ещё стоит старая сломанная версия.
Её нужно удалить из "Расширения → Установленные в память".
