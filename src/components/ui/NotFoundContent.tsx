"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";

const CatNotFound = dynamic(
  () => import("./CatNotFound").then((mod) => mod.CatNotFound),
  {
    ssr: false,
    loading: () => <div className="h-[280px] w-full max-w-[420px] mx-auto" />,
  },
);

export function NotFoundContent() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg rounded-3xl border border-border/80 bg-card/80 p-6 sm:p-10 shadow-elev-lg backdrop-blur-xl text-center"
      >
        <CatNotFound />

        <div className="mt-4">
          <span className="text-6xl sm:text-7xl font-black tracking-tight text-primary/40 select-none block">
            404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-2">
            This page wandered off
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Like a fresh veggie that sold out, we couldn't find it.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elev-sm hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to the shop</span>
          </Link>
          <Link
            href="/#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-foreground shadow-xs hover:bg-secondary hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span>Store timings & map</span>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
