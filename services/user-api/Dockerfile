FROM oven/bun:latest
WORKDIR /app
COPY . .
WORKDIR /app/services/user-api
RUN bun install --frozen-lockfile
EXPOSE 8080
CMD ["bun", "run", "src/index.ts"]
