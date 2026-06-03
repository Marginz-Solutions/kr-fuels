import type { Metadata } from "next";
import ProductScreen, { productMetadata } from "@/components/ProductScreen";

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return productMetadata(slug);
}

export default async function DynamicProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductScreen slug={slug} />;
}
