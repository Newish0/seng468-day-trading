# Stage 1: Build the web-ui using Vite
FROM oven/bun:latest AS ui-builder

WORKDIR /app
COPY . .

WORKDIR /app/services/web-ui
RUN bun install
RUN bun run build

# Stage 2: Set up Nginx with static files and config
FROM nginx:alpine

# Remove default Nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy global Nginx config to the correct place
COPY ./services/gateway/nginx.conf /etc/nginx/nginx.conf

# Copy per-site/server configs 
COPY ./services/gateway/app.conf /etc/nginx/conf.d/app.conf

# Copy built assets from the ui-builder stage
COPY --from=ui-builder /app/services/web-ui/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
