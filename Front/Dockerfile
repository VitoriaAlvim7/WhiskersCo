# 1) Compila o Angular em modo produção
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# 2) Serve os arquivos estáticos com nginx (que também repassa /api para o back)
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/whiskers-co /usr/share/nginx/html
EXPOSE 80
