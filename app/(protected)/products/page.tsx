import { fetchServerApi } from "@/hooks/server-fetch";
import ProductsPage from "./ProductsPage";
import { CategoriesResponse, ProductsResponse } from "@/types";

export default async function Page() {
  const [productsRes, categoriesRes] = await Promise.all([
    fetchServerApi<ProductsResponse>("/api/v1/products"),
    fetchServerApi<CategoriesResponse>("/api/v1/products/categories"),
  ]);

  return (
    <ProductsPage
      initialProducts={productsRes.message ?? []}
      initialCategories={categoriesRes.data ?? []}
    />
  );
}