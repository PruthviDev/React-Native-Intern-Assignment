/**
 * Centralized popup API – showPopup / hidePopup from anywhere in the tree.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import AppPopup, { AppPopupProps, PopupAction } from '../components/AppPopup';

export interface ShowPopupOptions {
  title: string;
  message?: string;
  actions?: PopupAction[];
  dismissible?: boolean;
}

interface PopupContextValue {
  showPopup: (options: ShowPopupOptions) => void;
  hidePopup: () => void;
}

const PopupContext = createContext<PopupContextValue | undefined>(undefined);

const DEFAULT_ACTIONS: PopupAction[] = [{ label: 'OK', variant: 'primary' }];

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<ShowPopupOptions | null>(null);
  const visible = !!config;
  // Deduplicate rapid identical network/error popups
  const lastKeyRef = useRef<string | null>(null);
  const lastAtRef = useRef(0);

  const hidePopup = useCallback(() => {
    setConfig(null);
    lastKeyRef.current = null;
  }, []);

  const showPopup = useCallback((options: ShowPopupOptions) => {
    const key = `${options.title}|${options.message ?? ''}`;
    const now = Date.now();
    if (key === lastKeyRef.current && now - lastAtRef.current < 1200) {
      return;
    }
    lastKeyRef.current = key;
    lastAtRef.current = now;
    setConfig(options);
  }, []);

  const value = useMemo(
    () => ({ showPopup, hidePopup }),
    [showPopup, hidePopup],
  );

  const popupProps: AppPopupProps = {
    visible,
    title: config?.title ?? '',
    message: config?.message,
    actions: config?.actions?.length ? config.actions : DEFAULT_ACTIONS,
    dismissible: config?.dismissible ?? true,
    onDismiss: hidePopup,
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
      <AppPopup {...popupProps} />
    </PopupContext.Provider>
  );
};

export const usePopup = (): PopupContextValue => {
  const ctx = useContext(PopupContext);
  if (!ctx) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return ctx;
};

/** Imperative bridge for non-React layers (API / network handler) */
type PopupListener = (options: ShowPopupOptions) => void;
let imperativeListener: PopupListener | null = null;

export const registerPopupListener = (listener: PopupListener | null) => {
  imperativeListener = listener;
};

export const showPopup = (options: ShowPopupOptions) => {
  if (imperativeListener) {
    imperativeListener(options);
    return;
  }
  // Fallback when provider is not mounted yet
  console.warn('[Popup] showPopup called before PopupProvider mounted');
};

export default PopupProvider;
