FROM oven/bun:latest
WORKDIR /app
COPY . .
WORKDIR /app/services/user-api
RUN bun install --frozen-lockfile
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
