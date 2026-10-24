import { Providers } from "@/components/providers";
import { Storefront } from "@/components/storefront/Storefront";

export default function Home() {
  return (
    <Providers>
      <Storefront />
    </Providers>
  );
}
