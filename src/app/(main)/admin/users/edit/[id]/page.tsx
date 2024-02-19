import { api } from "@/trpc/server";
import { EditUserForm } from "../../../_components/edit-user";
import { redirect } from "next/navigation";

export default async function EditUser({ params }: { params: { id: string } }) {
  const user = await api.user.get.query(params.id);
  if (!user) redirect("/admin");
  return <EditUserForm user={user} />;
}
