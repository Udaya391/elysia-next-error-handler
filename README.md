# elysia-next-error-handler

[![npm version](https://badge.fury.io/js/elysia-next-error-handler.svg)](https://badge.fury.io/js/elysia-next-error-handler)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ElysiaJS error handler plugin for seamless integration with Next.js App Router.

[**Repository**](https://github.com/programming-with-ia/elysia-next-error-handler)

## Installation

```bash
pnpm add elysia-next-error-handler
```

## Usage

Use `createNextErrorHandler` to configure the error handling pipeline. It handles Next.js internal errors (like redirects and 404s) correctly so they bubble up to Next.js.

```typescript
// src/app/api/[[...slug]]/route.ts
import { Elysia } from "elysia";
import {
  createNextErrorHandler,
  nextJsError,
  apiError,
  notFoundError,
  ignoreValidationAndParseError,
  internalServerError,
  APIError,
} from "elysia-next-error-handler";

const app = new Elysia()
  .use(
    createNextErrorHandler([
      // 1. Standard handlers
      // CRITICAL: Must be first. Checks for Next.js internal errors (like redirects and notFound())
      // and re-throws them so Next.js can handle the control flow.
      nextJsError(),

      // Handles your custom APIError instances (e.g. throw new APIError("Bad Request", 400))
      apiError(),

      // Converts Elysia's NotFoundError (404) into Next.js's notFound()
      notFoundError(),

      // Skip handling Elysia's validation and parse errors in this middleware,
      // allowing Elysia's default behavior (or other plugins) to handle them.
      ignoreValidationAndParseError(),

      // 2. Custom Logging (Optional)
      // You can inject custom logic here, like logging to Sentry or console.
      // Call `next()` to continue to the final error handler.
      ({ error, next }) => {
        console.error("Global Error Handler Caught:", error);
        // Sentry.captureException(error);
        return next();
      },

      // 3. Final Fallback
      // Catches any remaining errors (500s) and returns a generic JSON response:
      // { success: false, message: "Internal Server Error" }
      internalServerError(),
    ])
  )
  .get("/hello", () => "Hello Elysia");

export const GET = app.handle;
export const POST = app.handle;
```

## API

### `createNextErrorHandler(handlers)`

Creates the plugin. Accepts an array of error handlers that are executed in order.

### Standard Handlers

- `nextJsError()`: Checks for Next.js internal errors (redirects, `notFound()`) and re-throws them so Next.js can handle them. **Must be placed early in the chain.**
- `apiError()`: Catches `APIError` instances and returns a structured JSON response `{ success: false, message, code }`.
- `notFoundError()`: Catches Elysia's `NotFoundError` and calls Next.js `notFound()`.
- `ignoreValidationAndParseError()`: Ignores Elysia's validation and parse errors so they can be handled by other handlers or default behavior.
- `internalServerError()`: Logs the error and returns a generic 500 response.

### `APIError`

A helper class for throwing operational errors with specific status codes and error codes.

#### Constructor

```typescript
new APIError(message: string, status?: number, code?: string)
```

- **message**: The error message string.
- **status**: HTTP status code (default: 500).
- **code**: Optional error code string (e.g., 'UNAUTHORIZED', 'USER_NOT_FOUND').

#### Usage Examples

**1. Basic Usage (Bad Request)**

```typescript
throw new APIError("Invalid input parameters", 400, "INVALID_INPUT");
```

**2. Unauthorized Access (401)**

```typescript
// Throws a 401 Unauthorized error
throw new APIError("You must be logged in to access this resource", 401, "UNAUTHORIZED");
```

**3. Resource Not Found (404)**

```typescript
// Throws a 404 Not Found error
throw new APIError(`User with ID ${userId} not found`, 404, "USER_NOT_FOUND");
```

#### Response Format

When an `APIError` is thrown, the `apiError()` handler formats the response as:

```json
{
  "success": false,
  "message": "User with ID 123 not found",
  "code": "USER_NOT_FOUND"
}
```
