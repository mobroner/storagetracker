"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "./StoreProvider";
import styles from "./Login.module.css";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useStore();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log("Client: Response received", responseData);

      if (response.ok) {
        console.log("Client: Login successful, redirecting...");
        const { user } = responseData;
        login(user);
        window.location.href = "/";
      } else {
        setError(responseData.error || "An unknown error occurred");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Sign in to your account</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
            />
          </div>
          {error && <p className="text-theme-danger">{error}</p>}
          {isSubmitting && <p className="text-theme-primary">Processing...</p>}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.button}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
        <p className={styles.link}>
          Don't have an account?{' '}
          <Link href="/register">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
