FROM oven/bun:latest
WORKDIR /app
COPY . .
WORKDIR /app/services/auth
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]