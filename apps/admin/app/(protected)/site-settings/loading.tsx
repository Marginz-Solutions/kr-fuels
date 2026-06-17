import { SettingsFormSkeleton } from "@/components/ui/RouteSkeletons";

export default function SiteSettingsLoading() {
  return <SettingsFormSkeleton maxWidth={640} cards={[1, 5]} />;
}
