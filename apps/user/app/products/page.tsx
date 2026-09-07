import type { Metadata } from "next";
import ProductScreen from "@/components/ProductScreen";
import { pageMetadata } from "@/lib/seo";

// ISR: catalog copy changes infrequently — serve from cache, refresh in background.
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Auto LPG | Clean Automotive Fuel In Tamil Nadu | K.R Trans Fuels",
  description:
    "Explore Auto LPG From K.R Trans Fuels — A Cleaner, Cost-Effective Automotive Fuel Available Across Tamil Nadu. Find Auto LPG Stations And Learn How It Works.",
  path: "/products",
});

export default function ProductsPage() {
  return <ProductScreen slug="auto-lpg" />;
}
