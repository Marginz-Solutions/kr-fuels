import type { Metadata } from "next";
import ProductScreen, { productMetadata } from "@/components/ProductScreen";

// ISR: catalog copy changes infrequently — serve from cache, refresh in background.
export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return productMetadata("lubricants");
}

export default function LubricantsPage() {
  return <ProductScreen slug="lubricants" />;
}
