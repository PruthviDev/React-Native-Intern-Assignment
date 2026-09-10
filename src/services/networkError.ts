/**
 * Normalizes fetch / HTTP failures into user-friendly AppNetworkError objects
 * and optionally surfaces them through the global popup.
 */

import { showPopup } from '../context/PopupContext';

export type NetworkErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CLIENT'
  | 'SERVER'
  | 'UNKNOWN';

export class AppNetworkError extends Error {
  code: NetworkErrorCode;
  status?: number;
  /** Already shown via global popup – screens can skip local UI */
  notified: boolean;

  constructor(
    message: string,
    code: NetworkErrorCode,
    status?: number,
    notified = false,
  ) {
    super(message);
    this.name = 'AppNetworkError';
    this.code = code;
    this.status = status;
    this.notified = notified;
  }
}

const USER_MESSAGES: Record<NetworkErrorCode, string> = {
  NETWORK:
    'Unable to connect. Please check your internet connection and try again.',
  TIMEOUT: 'The request timed out. Please try again.',
  UNAUTHORIZED: 'Your session is no longer valid. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'We could not find what you were looking for.',
  CLIENT: 'Something was wrong with that request. Please try again.',
  SERVER: 'Something went wrong on our server. Please try again.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

export const messageForStatus = (status: number): { code: NetworkErrorCode; message: string } => {
  if (status === 401) {
    return { code: 'UNAUTHORIZED', message: USER_MESSAGES.UNAUTHORIZED };
  }
  if (status === 403) {
    return { code: 'FORBIDDEN', message: USER_MESSAGES.FORBIDDEN };
  }
  if (status === 404) {
    return { code: 'NOT_FOUND', message: USER_MESSAGES.NOT_FOUND };
  }
  if (status >= 500) {
    return { code: 'SERVER', message: USER_MESSAGES.SERVER };
  }
  if (status >= 400) {
    return { code: 'CLIENT', message: USER_MESSAGES.CLIENT };
  }
  return { code: 'UNKNOWN', message: USER_MESSAGES.UNKNOWN };
};

export const normalizeNetworkError = (error: unknown): AppNetworkError => {
  if (error instanceof AppNetworkError) {
    return error;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (error.name === 'AbortError' || msg.includes('timeout')) {
      return new AppNetworkError(USER_MESSAGES.TIMEOUT, 'TIMEOUT');
    }
    if (
      msg.includes('network') ||
      msg.includes('failed to fetch') ||
      msg.includes('network request failed')
    ) {
      return new AppNetworkError(USER_MESSAGES.NETWORK, 'NETWORK');
    }
  }

  return new AppNetworkError(USER_MESSAGES.UNKNOWN, 'UNKNOWN');
};

export interface NotifyOptions {
  /** Skip global popup (caller shows inline UI instead) */
  silent?: boolean;
  title?: string;
}

/**
 * Convert an unknown error, optionally show a popup once, and return AppNetworkError.
 */
export const handleNetworkError = (
  error: unknown,
  options: NotifyOptions = {},
): AppNetworkError => {
  const normalized = normalizeNetworkError(error);

  if (!options.silent && !normalized.notified) {
    showPopup({
      title: options.title ?? 'Connection problem',
      message: normalized.message,
      actions: [{ label: 'OK', variant: 'primary' }],
    });
    normalized.notified = true;
  }

  return normalized;
};

export const NetworkErrorHandler = {
  normalize: normalizeNetworkError,
  handle: handleNetworkError,
  messageForStatus,
  USER_MESSAGES,
};

export default NetworkErrorHandler;
