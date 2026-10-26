"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, animate, useMotionValue, useTransform } from "framer-motion";

const KEY = "mg_splash";

export function SplashLoader({
  name = "MAGADI GREENS",
  ready = true,
}: {
  name?: string;
  ready?: boolean;
}) {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !sessionStorage.getItem(KEY);
    } catch {
      return false;
    }
  });
  const [done, setDone] = useState(false);
  const p = useMotionValue(0);
  const pct = useTransform(p, (v) => Math.round(v));
  const clip = useTransform(p, (v) => `inset(${100 - v}% 0 0 0)`);
  const [label, setLabel] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
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
    const cap = setTimeout(() => finish(), 4000);
    if (ready) {
      const t = setTimeout(() => finish(), reduce ? 700 : 1700);
      return () => {
        clearTimeout(t);
        clearTimeout(cap);
      };
    }
    return () => clearTimeout(cap);

    function finish() {
      animate(p, 100, {
        duration: 0.35,
        ease: "easeOut",
        onComplete: () => {
          setTimeout(() => {
            try {
              sessionStorage.setItem(KEY, "1");
            } catch {}
            document.documentElement.style.overflow = "";
            setDone(true);
          }, 350);
        },
      });
    }
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
