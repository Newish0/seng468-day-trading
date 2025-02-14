# Stage 1: Build the web-ui using Vite
FROM oven/bun:latest AS ui-builder

WORKDIR /app

# Copy web-ui files 
COPY ./web-ui .
RUN bun install
RUN bun run build

# Stage 2: Set up Nginx with static files and config
FROM nginx:alpine

# Remove default Nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY ./gateway/nginx.conf /etc/nginx/conf.d

# Copy built assets from the ui-builder stage
COPY --from=ui-builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]