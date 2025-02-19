import { type Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { validator } from "hono/validator";

export function getValidator(fn: (value: any) => boolean) {
  return validator("json", (value, c) => {
    if (!fn(value)) {
      return handleError(c, new Error("Invalid request body"), "Invalid request body", 400);
    }
    return value;
  });
}

/**
 * Handles errors and returns a standardized JSON response.
 *
 * @param {Context} c - The Hono context object.
 * @param {unknown} error - The error that was caught.
 * @param {string} defaultMessage - A fallback error message if the error is unknown.
 * @param {ContentfulStatusCode} errorCode - Error code to use for know error
 * @returns A JSON response with an error message and appropriate status code.
 */
export function handleError(
  c: Context,
  error: unknown,
  defaultMessage: string,
  errorCode: ContentfulStatusCode = 400
) {
  // Determine the error message: use the actual error message if available, otherwise use the default message.
  const message = error instanceof Error ? error.message : defaultMessage;

  // Determine the status code: `errorCode` for known errors, 500 for unknown errors.
  const status = error instanceof Error ? errorCode : 500;

  // Return a JSON response with the error details.
  return c.json({ success: false, data: { error: message } }, status);
}
