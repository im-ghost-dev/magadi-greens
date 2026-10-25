import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

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
      <body
        className={`${jakarta.variable} font-sans antialiased text-foreground min-h-screen relative overflow-x-clip bg-[#f8fafc] dark:bg-[#0f1512] transition-colors duration-500`}
        style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
      >
        <AmbientBackground>
          {children}
        </AmbientBackground>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
