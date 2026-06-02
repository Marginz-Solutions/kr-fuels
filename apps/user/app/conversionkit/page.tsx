import { redirect } from "next/navigation";

// Conversion Kits are sold on the manufacturer site — match krfuels.com behaviour
// (krgfi.com/conversionkit.php → vibuh.com). Any direct hit on /conversionkit
// redirects there; the nav/footer link to it directly.
export default function ConversionKitPage() {
  redirect("https://vibuh.com/");
}
