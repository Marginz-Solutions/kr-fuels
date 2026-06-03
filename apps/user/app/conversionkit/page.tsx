import ProductScreen from "@/components/ProductScreen";

export const revalidate = 300;

// ProductScreen handles redirect vs content page based on Firestore is_external flag.
// Falls back to catalog content if no Firestore record exists for this slug.
export default function ConversionKitPage() {
  return <ProductScreen slug="conversionkit" />;
}
