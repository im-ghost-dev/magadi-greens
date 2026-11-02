import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Providers } from "@/components/providers";
import { SplashWrapper } from "@/components/ui/SplashWrapper";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAGADI GREENS | Fresh Fruits & Vegetables – Self Pick-Up",
  description:
    "Order fresh fruits and vegetables from MAGADI GREENS, Ittamadu, Bengaluru. Build your list online and pick it up packed and ready.",
  keywords: [
    "MAGADI GREENS",
    "fresh vegetables",
    "fruits",
    "Bengaluru",
    "Ittamadu",
    "self pick-up",
    "grocery",
  ],
  authors: [{ name: "MAGADI GREENS" }],
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🌿%3C/text%3E%3C/svg%3E",
  },
  openGraph: {
    title: "MAGADI GREENS | Fresh Fruits & Vegetables",
    description:
      "Build your list online and pick it up packed and ready. Ittamadu, Bengaluru.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.setAttribute("data-splash","1")}catch(e){}try{var s=localStorage.getItem("mg_theme");var d=s?s==="dark":(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light"}}catch(e){}})();`,
          }}
        />
        <noscript>
          <style>{`#app-root{visibility:visible!important}#splash-shell{display:none!important}`}</style>
        </noscript>
      </head>
      <body
        className={`${jakarta.variable} font-sans antialiased text-foreground min-h-screen relative bg-[#f8fafc] dark:bg-[#0f1512] transition-colors duration-500`}
        style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
      >
        <div
          id="splash-shell"
          aria-hidden="true"
          className="fixed inset-0 z-[100] grid place-items-center bg-[#f8fafc] dark:bg-[#0f1512] text-foreground"
        >
          <div className="relative select-none">
            <div className="text-[clamp(2rem,11vw,5rem)] font-extrabold tracking-tight leading-none opacity-[0.18]">
              MAGADI GREENS
            </div>
            <div className="absolute -bottom-5 right-0 text-[10px] tracking-widest opacity-70 tabular-nums">
              loading... 0 %
            </div>
          </div>
        </div>

        <Providers>
          <SplashWrapper />
          <div id="app-root">
            <AmbientBackground>
              {children}
            </AmbientBackground>
          </div>
        </Providers>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
