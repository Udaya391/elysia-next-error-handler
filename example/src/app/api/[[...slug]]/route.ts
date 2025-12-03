import { Elysia, t } from "elysia";
import {
  createNextErrorHandler,
  nextJsError,
  apiError,
  notFoundError,
  ignoreValidationAndParseError,
  internalServerError,
  APIError,
} from "elysia-next-error-handler";
import { redirect, notFound } from "next/navigation";

const app = new Elysia({ prefix: "/api" })
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
  .get("/hello", () => {
    return { message: "Hello from Elysia!" };
  })
  .get("/error", () => {
    throw new APIError("This is a custom API error", 400, "CUSTOM_ERROR");
  })
  .get("/next-not-found", () => {
    // This will be caught by nextJsError and handled by Next.js
    notFound();
  })
  .get("/next-redirect", () => {
    // This will be caught by nextJsError and handled by Next.js
    redirect("/");
  })
  .post("/validate", ({ body }) => {
    return { success: true, body };
  }, {
    body: t.Object({
      name: t.String(),
      age: t.Number()
    })
  });

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;
export const HEAD = app.handle;
