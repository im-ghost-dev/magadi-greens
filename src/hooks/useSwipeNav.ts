"use client";

import { useEffect, useRef } from "react";

interface UseSwipeNavOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  enabled?: boolean;
}

/**
 * Reusable horizontal swipe hook for navigating categories.
 *
 * Rules:
 * - Movement: |dx| > 60px, |dx| > |dy| * 1.5, completed in < 600ms.
 * - Axis locking: Locks axis after ~10px so vertical scrolling is never hindered.
 * - Respects passive listeners and touch-action: pan-y.
 * - Ignores touches starting inside inputs, textareas, selects, buttons being dragged,
 *   horizontally scrollable containers, open drawers, or when disabled.
 */
export function useSwipeNav<T extends HTMLElement = HTMLElement>({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: UseSwipeNavOptions) {
  const containerRef = useRef<T | null>(null);
  const optionsRef = useRef({ onSwipeLeft, onSwipeRight, enabled });

  useEffect(() => {
    optionsRef.current = { onSwipeLeft, onSwipeRight, enabled };
  }, [onSwipeLeft, onSwipeRight, enabled]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let axisLocked: "horizontal" | "vertical" | null = null;
    let isTracking = false;

    function isInsideIgnoredElement(target: EventTarget | null): boolean {
      if (!(target instanceof Element)) return false;

      // Inputs, textareas, selects, or elements explicitly marked to ignore swipe
      if (target.closest("input, textarea, select, [data-swipe-ignore]")) return true;

      // Check if inside an open BottomSheet, drawer, or dialog
      if (target.closest("[role='dialog'], [data-state='open'], [aria-modal='true']")) return true;

      // Check if inside any horizontally scrollable container (e.g. chips, carousels)
      let curr: Element | null = target;
      while (curr && curr !== el) {
        const style = window.getComputedStyle(curr);
        const overflowX = style.overflowX;
        if (
          (overflowX === "auto" || overflowX === "scroll") &&
          curr.scrollWidth > curr.clientWidth + 4
        ) {
          return true;
        }
        curr = curr.parentElement;
      }

      return false;
    }

    function onTouchStart(e: TouchEvent) {
      if (!optionsRef.current.enabled) return;
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      if (isInsideIgnoredElement(touch.target)) {
        isTracking = false;
        return;
      }

      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      axisLocked = null;
      isTracking = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!isTracking || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      // Lock gesture axis after ~10px movement
      if (!axisLocked) {
        if (Math.abs(dx) >= 10 || Math.abs(dy) >= 10) {
          if (Math.abs(dy) > Math.abs(dx)) {
            axisLocked = "vertical";
            isTracking = false; // Native vertical scroll continues without blocking
          } else {
            axisLocked = "horizontal";
          }
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (!isTracking || axisLocked === "vertical") {
        isTracking = false;
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) {
        isTracking = false;
        return;
      }

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const duration = Date.now() - startTime;

      isTracking = false;

      // Swipe criteria:
      // - Horizontal distance > ~60px
      // - |dx| > |dy| * 1.5
      // - Completed in under ~600ms
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && duration < 600) {
        if (dx < 0) {
          // Swipe left -> next category
          optionsRef.current.onSwipeLeft();
        } else {
          // Swipe right -> previous category
          optionsRef.current.onSwipeRight();
        }
      }
    }

    function onTouchCancel() {
      isTracking = false;
      axisLocked = null;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
  }, []);

  return containerRef;
}
