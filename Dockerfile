FROM node:18-alpine

WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package.json package-lock.json* ./

# Встановлюємо всі залежності
RUN npm install

# Копіюємо весь код після інсталяції залежностей
COPY . .

# Генеруємо Prisma Client з підтримкою Alpine ARM64
RUN npx prisma generate

EXPOSE 3000

# Запуск у режимі розробки з hot reload
CMD ["npm", "run", "start:dev"]
