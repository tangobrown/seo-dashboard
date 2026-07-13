"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastCtx = { toast: (message: string) => void };

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const toast = useCallback((msg: string) => {
    setMessage(msg);
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(t);
  }, [show, message]);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className={`toast${show ? " show" : ""}`} aria-live="polite">
        {message}
      </div>
    </Ctx.Provider>
  );
}
