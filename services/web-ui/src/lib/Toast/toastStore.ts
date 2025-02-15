import { writable } from "svelte/store";

export const toasts = writable<Toast[]>([]);

type Toast = {
  id: string;
  message: string;
  type: TOAST_TYPES;
};

export enum TOAST_TYPES {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
}

export function addToast({
  message,
  type = TOAST_TYPES.INFO,
  duration = 5000,
}: {
  message: string;
  type?: TOAST_TYPES;
  duration?: number;
}) {
  const id = Math.random().toString(36).substr(2, 9);

  toasts.update((currentToasts) => [...currentToasts, { id, message, type }]);

  setTimeout(() => {
    toasts.update((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, duration);
}
