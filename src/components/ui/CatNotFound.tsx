"use client";

import { useEffect, useMemo, useState } from "react";
import { Lottie } from "lottie-react";
import rawData from "../../../public/animations/404-cat.json";
import { themeLottie } from "@/lib/lottie-theme";

export function CatNotFound() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mql.addEventListener("change", onMotionChange);

    return () => {
      observer.disconnect();
      mql.removeEventListener("change", onMotionChange);
    };
  }, []);

  const themedAnimation = useMemo(() => {
    return themeLottie(rawData, isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className="w-full max-w-[420px] mx-auto select-none" aria-hidden="true">
      <Lottie
        src={themedAnimation}
        loop={!reduceMotion}
        autoplay={!reduceMotion}
        segment={reduceMotion ? [0, 1] : undefined}
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
      />
    </div>
  );
}
