import { redirect } from "next/navigation";

export default function DeveloperIndexRedirect() {
  redirect("/developer/needs");
}
