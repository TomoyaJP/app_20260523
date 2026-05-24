import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { developerCookieName, isDeveloperSessionValid } from "@/lib/developer-token";

export async function requireDeveloperSession(): Promise<void> {
  const jar = await cookies();
  const tok = jar.get(developerCookieName())?.value;
  if (!(await isDeveloperSessionValid(tok))) {
    redirect("/developer/login");
  }
}
