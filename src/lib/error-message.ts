import { ApiError } from "@/lib/api/client";

/** The sentence to show a person for any thrown value. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message.replace(/^[a-z_ ]+: /, "");
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
