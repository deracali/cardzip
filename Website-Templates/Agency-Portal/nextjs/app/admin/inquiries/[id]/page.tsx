import { AdminWorkspace } from "../../../../src/views/admin-portal-page";

export default async function AdminInquiryDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminWorkspace section="inquiries" inquiryId={id} />;
}
