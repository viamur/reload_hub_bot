# Базовый образ Node.js (легковесная версия на Alpine Linux)
FROM node:18-alpine

# Увеличиваем лимит памяти для Node.js (например, 2048 или 3072 МБ)
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Создаём рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект внутрь контейнера
COPY . .

# Собираем TypeScript
RUN npm run build

# Копируем ассеты отдельно в dist
RUN mkdir -p dist/assets && cp -r src/assets/* dist/assets/

# Задаём команду, которая будет выполняться при запуске контейнера
# Для dev-режима может быть и "npm run dev", но сейчас для примера укажем старт продакшн-сборки
CMD ["npm", "run", "start:prod"]
