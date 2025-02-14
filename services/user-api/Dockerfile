FROM oven/bun:latest
WORKDIR /app
COPY . .
WORKDIR /app/services/user-api
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
# to build: run from monorepo root with `docker build -f services/user-api/Dockerfile -t user-api-image .` 
