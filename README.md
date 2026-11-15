# Сборка резюме

Нужен Node.js версии 18 или новее. При первой настройке выполните:

```sh
npm ci
npx playwright install chromium
```

Для сборки обеих версий:

```sh
npm run build
```

Команда обновляет `Arapov-Frontend-Vue-CV-ru.pdf` и `Arapov-Frontend-Vue-CV-en.pdf` в корне репозитория. Текст редактируется в соответствующих Markdown-файлах, общие стили — в `resume.css`, фотография — в `photo.png`. После изменения исходников повторите сборку и проверьте полученные PDF.
