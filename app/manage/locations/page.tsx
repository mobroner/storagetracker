import ManageLocations from "@/app/components/ManageLocations";
import Link from "next/link";
import styles from "@/app/components/Button.module.css";

export default function ManageLocationsPage() {
  return (
    <div>
      <ManageLocations />
      <div className="mt-4 text-center">
        <Link href="/" className={styles.button}>
          Home
        </Link>
      </div>
    </div>
  );
}
