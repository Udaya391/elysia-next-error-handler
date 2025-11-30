import { Elysia } from "elysia";
import {
  nextJsError,
  apiError,
  notFoundError,
  ErrorHandler,
  internalServerError,
  ignoreValidationAndParseError,
} from "./handlers";

export const defaults: ErrorHandler[] = [
  nextJsError(),
  apiError(),
  notFoundError(),
  ignoreValidationAndParseError(),
  internalServerError(),
];

/** Creates a configured error handler plugin for Elysia in Next.js. */
export const createNextErrorHandler =
  (handlers: ErrorHandler[] = defaults) =>
  (app: Elysia) =>
    app.onError(async (context) => {
      let index = -1;

      const dispatch = async (i: number): Promise<ReturnType<ErrorHandler>> => {
        if (i <= index) throw new Error("next() called multiple times");
        index = i;

        const handler = handlers[i];
        if (!handler) return; // End of chain

        const next = async () => dispatch(i + 1);

        return handler({ ...context, next });
      };

      return dispatch(0);
    });

/** Default pre-configured error handler. */
export const nextErrorHandler = createNextErrorHandler();
