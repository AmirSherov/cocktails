FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Аргумент для определения порта приложения
ARG PORT=3000

# Установка переменной окружения PORT
ENV PORT=$PORT

# Экспозиция порта
EXPOSE $PORT

# По умолчанию запускаем в режиме разработки
# В продакшене нужно переопределить через docker-compose
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 