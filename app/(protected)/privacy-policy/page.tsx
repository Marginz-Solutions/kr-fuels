import { PrivacyPolicyResponse } from "@/types";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import { fetchServerApi } from "@/hooks/server-fetch";

export default async function Page() {
  const res = await fetchServerApi<PrivacyPolicyResponse>("/api/v1/privacy-policy");
  return <PrivacyPolicyPage initialData={res.message} />;
}