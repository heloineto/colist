import { type ReactNode, createContext, use, useState } from 'react';
import { armKeyboard } from '@/shared/lib/keyboard';

type OverlayState<Payload> = { opened: boolean; payload: Payload | null };
type OverlayApi<Payload> = OverlayState<Payload> & {
  open: (payload?: Payload) => void;
  close: () => void;
};

type Options = {
  /** Overlay auto-focuses an input: arm the iOS keyboard on `open`. */
  keyboard?: boolean;
};

/** One app-wide modal/drawer: `open(payload)` shows it; `payload` outlives `close` for the exit animation. */
export function createOverlay<Payload = never>(
  name: string,
  { keyboard = false }: Options = {}
) {
  const Context = createContext<OverlayApi<Payload> | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<OverlayState<Payload>>({
      opened: false,
      payload: null,
    });
    const api: OverlayApi<Payload> = {
      ...state,
      open: (payload) => {
        if (keyboard) armKeyboard();
        setState({ opened: true, payload: payload ?? null });
      },
      close: () => setState((previous) => ({ ...previous, opened: false })),
    };
    return <Context value={api}>{children}</Context>;
  }

  function useOverlay() {
    const context = use(Context);
    if (!context) throw new Error(`${name} used outside its provider`);
    return context;
  }

  return { Provider, useOverlay };
}
