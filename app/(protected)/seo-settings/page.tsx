import {
  SeoSettingsResponse,
} from "@/types";

import SeoSettingsPage from "./SeoSettingsPage";

import { fetchServerApi } from "@/hooks/server-fetch";

export default async function Page() {

  const res =
    await fetchServerApi<SeoSettingsResponse>(
      "/api/v1/seo-settings"
    );

  return (
    <SeoSettingsPage
      initialSeoSettings={res.message}
    />
  );
}