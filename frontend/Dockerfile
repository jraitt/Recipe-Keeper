# Multi-stage dockerfile that works for both dev and production
FROM node:20-alpine as base

WORKDIR /app
COPY package*.json ./

# Development stage
FROM base as development
RUN npm ci
COPY . .
EXPOSE 3020
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3020"]

# Production build stage
FROM base as build
ARG VITE_API_URL
RUN npm ci
COPY . .
RUN npm run build

# Production runtime with nginx
FROM nginx:alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Default to development if no target specified
FROM development