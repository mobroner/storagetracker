import ManageLocations from "@/app/components/ManageLocations";
import Link from "next/link";

export default function ManageLocationsPage() {
  return (
    <div>
      <ManageLocations />
      <div className="mt-4 text-center">
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
