FROM rust:1.75-slim-bookworm as builder

WORKDIR /usr/src/app

# Copy the source code
COPY . .

# Build the application
RUN cargo build --release

FROM debian:bookworm-slim

WORKDIR /usr/src/app

# Copy the binary from builder
COPY --from=builder /usr/src/app/target/release/matching-engine .

# Set environment variables
ENV RABBITMQ_HOST=rabbitmq
ENV RABBITMQ_PORT=5672
ENV RABBITMQ_USERNAME=guest
ENV RABBITMQ_PASSWORD=guest

# Run the binary
CMD ["./matching-engine"]
