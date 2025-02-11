FROM oven/bun:latest

WORKDIR /auth

COPY package.json bun.lockb ./

RUN bun install

COPY src/ ./src/

EXPOSE 3000 

CMD ["bun", "src/index.ts"]
