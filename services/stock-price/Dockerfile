FROM rust:latest as builder
WORKDIR /usr/src/stock-price

COPY . .
RUN cargo install --path .


FROM debian:bookworm-slim

# Install OpenSSL and CA certificates because package `reqwest` needs them
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     openssl \
#     ca-certificates \
#     && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/cargo/bin/stock-price /usr/local/bin/stock-price
EXPOSE 3000
CMD ["stock-price"]