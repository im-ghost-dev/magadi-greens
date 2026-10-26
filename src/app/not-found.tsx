import type { Metadata } from "next";
import { NotFoundContent } from "@/components/ui/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found | Magadi Greens",
};

export default function NotFound() {
  return <NotFoundContent />;
}
