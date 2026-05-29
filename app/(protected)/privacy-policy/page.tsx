import PrivacyPolicyPage from "./PrivacyPolicyPage";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const res = await serverFetch("/privacy-policy");
  return <PrivacyPolicyPage initialData={res.message} />;
}