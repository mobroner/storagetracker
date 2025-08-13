import ManageStorageAreas from "@/app/components/ManageStorageAreas";
import Link from "next/link";

export default function ManageStorageAreasPage() {
  return (
    <div>
      <ManageStorageAreas />
      <div className="mt-4 text-center">
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
