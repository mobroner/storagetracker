'use client';

import ManageLocations from "@/app/components/ManageLocations";
import Link from "next/link";
import buttonStyles from "@/app/components/Button.module.css";
import styles from "./page.module.css";

export default function ManageLocationsPage() {
  return (
    <div className={styles.container}>
      <ManageLocations />
      <div className="mt-4 text-center">
        <Link href="/" className={buttonStyles.button}>
          Home
        </Link>
      </div>
    </div>
  );
}
