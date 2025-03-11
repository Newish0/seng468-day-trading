FROM rust:latest as builder
WORKDIR /usr/src/matching-engine

COPY . .
RUN cargo install --path .


FROM debian:bookworm-slim

COPY --from=builder /usr/local/cargo/bin/matching-engine /usr/local/bin/matching-engine
EXPOSE 3000
CMD ["matching-engine"]