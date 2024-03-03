import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { type User } from "@prisma/client";
import Link from "next/link";

export default function SettingsTable({
  user,
}: {
  user: Omit<User, "role" | "emailVerified" | "hashedPassword">;
}) {
  return (
    <div className="py-10 md:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your settings here
        </p>
      </div>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Email</TableCell>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>
              <Link href="/dashboard/settings/change-email">Edit</Link>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Password</TableCell>
            <TableCell className="font-medium">Change password</TableCell>
            <TableCell>
              <Link href="/dashboard/settings/change-password">Edit</Link>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Avatar</TableCell>
            <TableCell className="font-medium">{user.avatar}</TableCell>
            <TableCell>
              <Link href="/dashboard/settings/change-avatar">Edit</Link>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
