# Stage 1: Build React App
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine
# Copy custom nginx configuration mapping explicitly preventing 404s on React Router reload
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
