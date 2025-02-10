# auth-service

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.45. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## API Specs

These are the endpoints for registering and logging in

### `/register`

- **Method:** POST
- **Request Body:**
    ```json
    {
        "user_name": "string",
        "password": "string",
        "name": "string"
    }
    ```
- **Response:**
    - **Success (Account Creation Successful):**
    ```json
    {
        "success": true,
        "data": null
    }
    ```
    - **Failure (Error in Account Creation):**
    ```json
    {
        "success": false,
        "data": {
            "error": "string"
        }
    }
    ```

---

### `/login`

- **Method:** POST
- **Request Body:**
    ```json
    {
        "user_name": "string",
        "password": "string"
    }
    ```
- **Response:**
    - **Failure (Incorrect Password or Username):**
    ```json
    {
        "success": false,
        "data": {
            "error": "string"
        }
    }
    ```
    - **Success (Login Successful, Returns Auth Token):**
    ```json
    {
        "success": true,
        "data": {
            "token": "string"
        }
    }
    ```

