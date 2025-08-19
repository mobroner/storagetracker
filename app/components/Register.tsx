"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./Register.module.css";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const entries = Object.fromEntries(formData.entries());
    const data: RegisterFormData = {
      name: String(entries.name),
      email: String(entries.email),
      password: String(entries.password)
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Get the userId from the registration response
        const { userId } = await response.json();
        
        // After successful registration, populate the taxonomy
        try {
          const taxonomyResponse = await fetch('/api/populate-taxonomy', { 
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }) // Pass the specific userId
          });
          
          if (!taxonomyResponse.ok) {
            console.error('Failed to populate taxonomy for new user');
          }
        } catch (taxonomyError) {
          console.error('Error populating taxonomy:', taxonomyError);
        }

        // Redirect to login regardless of taxonomy population result
        router.push("/login");
      } else {
        const { error } = await response.json();
        setError(error);
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create an account</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={styles.input}
              placeholder="Create a password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className={styles.signInLink}>
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
