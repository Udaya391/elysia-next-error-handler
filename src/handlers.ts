import { notFound } from "next/navigation";
import {
  ValidationError,
  ParseError,
  NotFoundError,
  type ErrorHandler as ElysiaErrorHandler,
} from "elysia";

import { isNextJsInternalError } from "./utils";
import { APIError } from "./error";

export type ErrorContext = Parameters<ElysiaErrorHandler>[0] & {
  next: () => ReturnType<ElysiaErrorHandler>;
};

export type ErrorHandler = (
  context: ErrorContext
) => ReturnType<ElysiaErrorHandler>;

/** Handles Next.js internal errors (redirects, notFound). */
export const nextJsError =
  (): ErrorHandler =>
  ({ error, next }) => {
    if (isNextJsInternalError(error)) {
      throw error;
    }
    return next();
  };

/** Handles APIError instances. */
export const apiError =
  (): ErrorHandler =>
  ({ error, set, next }) => {
    if (error instanceof APIError) {
      set.status = error.status;
      return {
        success: false,
        message: error.message,
        code: error.code,
      };
    }
    return next();
  };

/** Handles 404 Not Found errors. */
export const notFoundError =
  (): ErrorHandler =>
  ({ error, next }) => {
    if (error instanceof NotFoundError) {
      notFound();
    }
    return next();
  };

export const ignoreValidationAndParseError =
  (): ErrorHandler =>
  ({ error, next }) => {
    if (error instanceof ValidationError || error instanceof ParseError) {
      return;
    }
    return next();
  };

export const internalServerError =
  (): ErrorHandler =>
  ({ error, set }) => {
    console.error("Internal Server Error:", error);

    set.status = 500;
    return {
      success: false,
      message: "Internal Server Error",
    };
  };
