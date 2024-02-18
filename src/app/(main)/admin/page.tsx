import { api } from "@/trpc/server";
import UsersTable from "./_components/users-table";

export default async function Users() {
  const users = await api.user.list.query({
    page: 1,
    perPage: 100,
  });
  return <UsersTable users={users} />;
}
