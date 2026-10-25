"use client";

/**
 * "Add to list" animation: a small circle (the product photo, or a green dot)
 * flies from the product card to the cart badge in the header, then the badge
 * bounces. Pure DOM + Web Animations API so it works without extra deps and is
 * cheap on mobile. Callers should skip this when prefers-reduced-motion is set.
 */
export function flyToCart(fromEl: HTMLElement | null, imgUrl?: string | null) {
  if (typeof window === "undefined" || !fromEl) return;
  const target = document.getElementById("mg-cart-badge");
  if (!target) return;

  const from = fromEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const dot = document.createElement("div");
  const size = 34;
  Object.assign(dot.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "9999px",
    zIndex: "80",
    pointerEvents: "none",
    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
    backgroundColor: "#2b8a35",
    backgroundSize: "cover",
    backgroundPosition: "center",
  } as CSSStyleDeclaration);
  if (imgUrl) dot.style.backgroundImage = `url("${imgUrl}")`;
  document.body.appendChild(dot);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const anim = dot.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(0.8)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.3 },
    ],
    { duration: 650, easing: "cubic-bezier(0.5, -0.2, 0.3, 1)" },
  );

  anim.onfinish = () => {
    dot.remove();
    // Bounce the badge.
    target.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.4)" },
        { transform: "scale(1)" },
      ],
      { duration: 300, easing: "ease-out" },
    );
  };
}
