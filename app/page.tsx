import { redirect } from "next/navigation";

export default function RootRedirect() {
  // Send base URL to the public landing page
  redirect("/home");
}
