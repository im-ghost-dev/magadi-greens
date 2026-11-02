"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function SplashLoader({
  name = "MAGADI GREENS",
  ready = true,
}: {
  name?: string;
  ready?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const p = useMotionValue(0);
  const pct = useTransform(p, (v) => Math.round(v));
  const clip = useTransform(p, (v) => `inset(${100 - v}% 0 0 0)`);
  const [label, setLabel] = useState(0);
  const reduce = useReducedMotion();
  const finishedRef = useRef(false);

  // Synchronously mount React splash and unmount SSR shell before first paint
  useIsomorphicLayoutEffect(() => {
    let shouldShow = false;
    try {
      shouldShow = document.documentElement.dataset.splash === "1";
    } catch {
      shouldShow = false;
    }

    if (shouldShow) {
      setShow(true);
      const shell = document.getElementById("splash-shell");
      if (shell) shell.remove();
    } else {
      delete document.documentElement.dataset.splash;
      const shell = document.getElementById("splash-shell");
      if (shell) shell.remove();
    }

    return () => {
      // Safety cleanup on unmount or error so page is never hidden
      delete document.documentElement.dataset.splash;
      document.documentElement.style.overflow = "";
      const shell = document.getElementById("splash-shell");
      if (shell) shell.remove();
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    document.documentElement.style.overflow = "hidden";
    const unsub = pct.on("change", setLabel);
    return () => {
      unsub();
      document.documentElement.style.overflow = "";
    };
  }, [show, pct]);

  useEffect(() => {
    if (!show) return;
    // run to 90% in 1.6s, finish to 100% once data is ready (or after 4s cap)
    const a = animate(p, 90, { duration: reduce ? 0.6 : 1.6, ease: "easeInOut" });
    return () => a.stop();
  }, [show, p, reduce]);

  useEffect(() => {
    if (!show) return;

    function finish() {
      if (finishedRef.current) return;
      finishedRef.current = true;
      animate(p, 100, {
        duration: 0.35,
        ease: "easeOut",
        onComplete: () => {
          // Reveal app root as the splash animation exits
          delete document.documentElement.dataset.splash;
          document.documentElement.style.overflow = "";
          setTimeout(() => {
            setDone(true);
          }, 350);
        },
      });
    }

    const cap = setTimeout(() => {
      delete document.documentElement.dataset.splash;
      const shell = document.getElementById("splash-shell");
      if (shell) shell.remove();
      document.documentElement.style.overflow = "";
      finish();
    }, 4000);

    if (ready) {
      const t = setTimeout(() => finish(), reduce ? 700 : 1700);
      return () => {
        clearTimeout(t);
        clearTimeout(cap);
      };
    }
    return () => clearTimeout(cap);
  }, [show, ready, p, reduce]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="splash"
          role="status"
          className="fixed inset-0 z-[100] grid place-items-center bg-background text-foreground"
          initial={{ opacity: 1 }}
          exit={
            reduce
              ? { opacity: 0 }
              : { scale: 6, opacity: 0, transition: { duration: 0.7, ease: [0.7, 0, 0.84, 0] } }
          }
        >
          <span className="sr-only">Loading {name}</span>
          <div className="relative select-none" aria-hidden>
            <div className="text-[clamp(2rem,11vw,5rem)] font-extrabold tracking-tight leading-none opacity-[0.18]">
              {name}
            </div>
            <motion.div
              className="absolute inset-0 text-[clamp(2rem,11vw,5rem)] font-extrabold tracking-tight leading-none text-foreground"
              style={{ clipPath: clip, WebkitClipPath: clip }}
            >
              {name}
            </motion.div>
            <div className="absolute -bottom-5 right-0 text-[10px] tracking-widest opacity-70 tabular-nums">
              loading... {label} %
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
