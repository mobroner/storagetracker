import ManageGroups from "@/app/components/ManageGroups";
import Link from "next/link";

export default function ManageGroupsPage() {
  return (
    <div>
      <ManageGroups />
      <div className="mt-4 text-center">
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
