import ProductsPage from "./ProductsPage";
import { CategoriesResponse, ProductsResponse } from "@/types";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const [productsRes, categoriesRes] = await Promise.all([
    serverFetch("/api/v1/products"),
    serverFetch("/api/v1/products/categories"),
  ]);

  return (
    <ProductsPage
      initialProducts={productsRes.message ?? []}
      initialCategories={categoriesRes.data ?? []}
    />
  );
}