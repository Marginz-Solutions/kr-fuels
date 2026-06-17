import type { Metadata } from "next";
import ProductScreen, { productMetadata } from "@/components/ProductScreen";

// ISR: catalog copy changes infrequently — serve from cache, refresh in background.
export const revalidate = 300;

// Default products screen = Auto LPG (selected in the product picker).
export function generateMetadata(): Promise<Metadata> {
  return productMetadata("auto-lpg");
}

export default function ProductsPage() {
  return <ProductScreen slug="auto-lpg" />;
}
