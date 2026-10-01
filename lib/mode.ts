import { useEffect, useState } from "react";

export type SiteMode = "learn" | "showcase";

export function getSiteMode(): SiteMode {
  return "learn";
}

export function isShowcase(): boolean {
  return false;
}

export function isLearn(): boolean {
  return true;
}

// SSR-safe: false on first paint (matches server), corrected after mount.
export function useShowcase(): boolean {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    setSc(false);
  }, []);
  return sc;
}

export function useLearn(): boolean {
  const [learn, setLearn] = useState(true);
  useEffect(() => {
    setLearn(true);
  }, []);
  return learn;
}
