# Аукцион · Циан

15-секундный промо-ролик о мобильном прототипе продажи квартиры на аукционе.

- Статус: готово.
- Формат: 1920×1080, 30 fps, 15 секунд; без озвучки, с черновой фоновой музыкой.
- Итог: `out/auction-promo_16x9.mp4` (до 20 МБ).
- Бренд-профиль: `brand/` (снимок из `../brand`).

## Бриф

- Фича: продавец задаёт условия и публикует аукцион; покупатель делает ставку и видит её принятие.
- Аудитория и назначение: короткое промо для продавцов и покупателей недвижимости.
- Факты и точные тексты: `src/pages/AuctionPage.tsx`, `tasks/auction/task.md`.
- Язык: русский. Формат: 16:9.
- Изображение квартиры: локальная копия фотографии фасада из `src/pages/AuctionPage.tsx`, сохранённая в `assets/apartment-exterior.jpg` для офлайн-рендера.
- Финал: iPhone уезжает вниз, круглый знак Циана запускает сине-оранжево-жёлто-белый переход, затем появляется белый экран с текстом «Циан Аукцион. Задайте условия и запустите торги».

## Пересборка

```sh
../../.venv/bin/python ../../.agents/skills/product-motion/scripts/render.py video.html video --fmt h --qs subs=0 --out build/auction-promo.mp4
../../.venv/bin/python ../../.agents/skills/product-motion/scripts/music.py plan.js --out build/music.wav
../../.venv/bin/python ../../.agents/skills/product-motion/scripts/assemble.py --video build/auction-promo.mp4 --audio build/music.wav --out out/auction-promo_16x9.mp4
```

Временные файлы в `build/` и MP4 в `out/` не добавляются в Git.
