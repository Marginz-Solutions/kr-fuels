import SeoSettingsPage from "./SeoSettingsPage";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {

  const res =
    await serverFetch(
      "/seo-settings"
    );

  return (
    <SeoSettingsPage
      initialSeoSettings={res.message}
    />
  );
}