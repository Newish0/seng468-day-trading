# seng468-day-trading

## Repo Structure

```
seng468-day-trading/
├── services/
│   ├── foobar-service/    # A test to make sure Bun workspace is correctly setup
│   ├── user-api/          # TypeScript service
│   ├── auth/              # TypeScript service
│   ├── matching-engine/   # Rust service
│   ├── nginx/             # Nginx configuration and assets
│   ├── web-ui/            # Single page web UI
├── packages/              # Shared Typescript libraries
│   ├── foobar-package/    # A test to make sure Bun workspace is correctly setup
│   ├── shared-utils/      # Typescript Utility library
│   ├── shared-types/      # Typescript Shared types/interfaces
│   ├── shared-models/     # Typescript database models/schemes
├── docker-compose.yml     # Orchestrates services
├── package.json           # For managing shared TypeScript dependencies
├── tsconfig.base.json     # Shared TypeScript configuration
├── README.md              # Documentation
├── package.json           # Manages Typescript workspaces/shared packages
├── tsconfig.base.json     # Global Typescript config for all Typescript services
├── README.md              # Documentation

```

> NOTE: Please do not directly install packages to the root Typescript project. The root `package.json` is only for managing the different workspaces.

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