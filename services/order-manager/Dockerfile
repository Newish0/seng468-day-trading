FROM oven/bun:latest
WORKDIR /app
COPY . .
WORKDIR /app/services/order-manager
RUN bun install
EXPOSE 3002
CMD ["bun", "run", "src/index.ts"]