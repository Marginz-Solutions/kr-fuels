import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  const session = (await cookies()).get("session");

  if (session) {
    redirect("/dashboard"); // logged in → go to dashboard
  } else {
    redirect("/login");     // not logged in → go to login
  }
}