import { useToast } from "./ToastProvider";

// Hook API to use in functional components
export const useToaster = () => {
  const { showError, showInfo, showSuccess, showWarning } = useToast();
  return { showError, showInfo, showSuccess, showWarning };
};

// Backward-compatible function exports for existing imports
let cached: ReturnType<typeof useToast> | null = null;
export const bindToastApi = (api: ReturnType<typeof useToast>) => {
  cached = api;
};

export const showError = (message: string) => cached?.showError(message);
export const showSuccess = (message: string) => cached?.showSuccess(message);
export const showWarning = (message: string) => cached?.showWarning(message);
export const showInfo = (message: string) => cached?.showInfo(message);

// Minimal replacement for legacy showAlert usage
export const showAlert = (
  message: string,
  actionLabel?: string,
  actionPath?: string
) => {
  // For now, just show an info toast; action button handling can be added later
  if (message) {
    cached?.showInfo(`${message}${actionLabel ? ` — ${actionLabel}` : ""}`);
  }
};
