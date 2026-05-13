import { getEmailTemplates } from "@/lib/actions/email-templates";
import { getNewsletterSubscribers } from "@/lib/actions/newsletter";
import EmailsClient from "./EmailsClient";

export default async function EmailsPage() {
  const [templates, subscribersResult] = await Promise.all([
    getEmailTemplates(),
    getNewsletterSubscribers(),
  ]);

  return (
    <EmailsClient
      templates={templates}
      subscribers={subscribersResult.subscribers ?? []}
    />
  );
}
