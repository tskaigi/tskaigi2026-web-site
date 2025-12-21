import { redirect } from "next/navigation";
import { redirectMap } from "@/lib/redirects";

export default function Page() {
  redirect(redirectMap["/sponsors/call-for-sponsors"]);
}
