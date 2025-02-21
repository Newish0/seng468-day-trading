# seng468-day-trading

## Repo Structure

```
seng468-day-trading/
├── services/
│   ├── foobar-service/    # A test to make sure Bun workspace is correctly setup
│   ├── user-api/          # TypeScript service
│   ├── auth/              # TypeScript service
│   ├── matching-engine/   # Rust service
│   ├── gateway/           # Nginx configuration and assets
│   ├── web-ui/            # Single page web UI
├── packages/              # Shared Typescript libraries
│   ├── foobar-package/    # A test to make sure Bun workspace is correctly setup
│   ├── shared-utils/      # Typescript Utility library
│   ├── shared-types/      # Typescript Shared types/interfaces
│   ├── shared-models/     # Typescript database models/schemes
├── docker-compose.yml     # Orchestrates services
├── package.json           # Manages Typescript workspaces/shared packages and project scripts
├── tsconfig.base.json     # Global Typescript config for all Typescript services
├── README.md              # Documentation

```

> NOTE: Please do not directly install packages to the root Typescript project. The root `package.json` is only for managing the different workspaces.

## Quick Start

From the root of the project, run the docker compose 

```
docker-compose up --build
```

After running this, the frontend will be accessible at http://localhost:8080/, and you will also be able to communicate with the API at http://localhost:8080/



## Workspaces breakdown

This outlines how to use workspaces.

1. The root `package.json` details where each workspaces are.
2. `foobar-package` exports the `somePackageFunc` function (in `foobar-package/index.ts`).
3. `service/foobar-service/package.json` has `"foobar-package": "workspace:*"` in it's dependencies.
4. In `index.ts` of `foobar-service`, we can call the `somePackageFunc` function from `foobar-package`.
5. If everything is setup corrrectly, when we run `bun run index.ts` inside of `foobar-service`, we should get
   ```
   Hello from foobar SERVICE!
   Hello from foobar PACKAGE!
   ```

## Prerequisites

- Bun v1.1.x (To be upgraded to v1.2 prior to starting the project)
- Rust v1.84.0
- Docker

## Running End to End Test Script

End to end test script uses Bun's built-in test runner (bun:test).

1. First run docker compose (if it's not already running)

   ```
   docker-compose up --build
   ```

2. Run the tests

   To run all the tests:
   ```
   bun test
   ```

   To run a specific test file:
   ```
   bun test {filename}
   ```
