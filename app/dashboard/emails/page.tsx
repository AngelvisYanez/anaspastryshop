import { getEmailTemplates } from "@/lib/actions/email-templates";
import { getNewsletterSubscribers } from "@/lib/actions/newsletter";
import EmailsClient from "./EmailsClient";
import { DashboardPage } from "../DashboardPage";

export default async function EmailsPage() {
  const [templates, subscribersResult] = await Promise.all([
    getEmailTemplates(),
    getNewsletterSubscribers(),
  ]);

  return (
    <DashboardPage
      title="Emails"
      description="Campañas de newsletter y plantillas de notificaciones automáticas."
    >
      <EmailsClient
        templates={templates}
        subscribers={subscribersResult.subscribers ?? []}
      />
    </DashboardPage>
  );
}
