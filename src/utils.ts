import { DataMakerError } from "./error";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// https://stackoverflow.com/a/19709846
const startsWithSchemeRegexp = new RegExp("^(?:[a-z]+:)?//", "i");
export const isAbsoluteURL = (url: string): boolean => {
  return startsWithSchemeRegexp.test(url);
};

/**
 * Read an environment variable.
 *
 * Will return undefined if the environment variable doesn't exist or cannot be accessed.
 */
export const readEnv = (env: string): string | undefined => {
  if (typeof process !== "undefined") {
    return process.env?.[env] ?? undefined;
  }
  return undefined;
};

// https://stackoverflow.com/a/34491287
export function isEmptyObj(obj: Object | null | undefined): boolean {
  if (!obj) return true;
  for (const _k in obj) return false;
  return true;
}

// https://eslint.org/docs/latest/rules/no-prototype-builtins
export function hasOwn(obj: Object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function debug(action: string, ...args: any[]) {
  if (typeof process !== "undefined" && process.env["DEBUG"] === "true") {
    console.log(`DataMaker:DEBUG:${action}`, ...args);
  }
}

/**
 * https://stackoverflow.com/a/2117523
 */
export const uuid4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const isRunningInBrowser = () => {
  return (
    // @ts-ignore
    typeof window !== "undefined" &&
    // @ts-ignore
    typeof window.document !== "undefined" &&
    // @ts-ignore
    typeof navigator !== "undefined"
  );
};

export const safeJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return undefined;
  }
};

/**
 * Encodes a string to Base64 format.
 */
export const toBase64 = (str: string | null | undefined): string => {
  if (!str) return "";
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64");
  }

  if (typeof btoa !== "undefined") {
    return btoa(str);
  }

  throw new DataMakerError(
    "Cannot generate b64 string; Expected `Buffer` or `btoa` to be defined"
  );
};

export const validatePositiveInteger = (name: string, n: unknown): number => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new DataMakerError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new DataMakerError(`${name} must be a positive integer`);
  }
  return n;
};
