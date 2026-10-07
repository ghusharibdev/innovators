import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { TranscriptForm } from "@/components/transcript-form";
import { AuthError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TranscriptPage() {
  const admin = await requireAdmin().catch((error: unknown) => {
    if (error instanceof AuthError) return null;
    throw error;
  });

  // Non-admins never see the transcript workspace; send them to their own home.
  if (!admin) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Create from Transcript"
        subtitle="Paste the agreed client meeting transcript. Gemini extracts the projects and tasks, the server validates them against the company directory, and one transaction saves everything — or nothing at all."
      />
      <TranscriptForm />
    </>
  );
}
