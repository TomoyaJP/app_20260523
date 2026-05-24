import { NewAppRegistrationForm } from "@/app/developer/apps/new/NewAppRegistrationForm";
import { requireDeveloperSession } from "@/lib/developer-session";

export default async function NewAppPage() {
  await requireDeveloperSession();
  return <NewAppRegistrationForm />;
}
