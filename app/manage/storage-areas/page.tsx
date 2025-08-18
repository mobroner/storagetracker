import ManageStorageAreas from "@/app/components/ManageStorageAreas";
import Link from "next/link";
import styles from "@/app/components/Button.module.css";

export default function ManageStorageAreasPage() {
  return (
    <div>
      <ManageStorageAreas />
      <div className="mt-4 text-center">
        <Link href="/" className={styles.button}>
          Home
        </Link>
      </div>
    </div>
  );
}
