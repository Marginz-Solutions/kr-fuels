import { redirect } from "next/navigation";

// Tanks & Multivalves are sold on the manufacturer site — match krfuels.com
// behaviour (krgfi.com/tanks.php → vibuh.com). Any direct hit on /tanks redirects
// there; the nav/footer link to it directly.
export default function TanksPage() {
  redirect("https://vibuh.com/");
}
