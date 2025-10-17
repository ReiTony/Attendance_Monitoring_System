import { ApiError } from "./apiError";

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = <T = never>(error: ApiError): Result<T> => ({
  ok: false,
  error,
});

export function isOk<T>(r: Result<T>): r is { ok: true; data: T } {
  return r.ok === true;
}
export function isErr<T>(r: Result<T>): r is { ok: true; data: T } {
  return !r.ok;
}
