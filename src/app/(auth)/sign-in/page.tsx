"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false, // Prevent automatic redirection
    });
    console.log(result);


    if (result?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard"); // Redirect to the dashboard after successful login
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSignIn} className="p-6 bg-black shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4">Sign In</h2>

        {error && <p className="text-red-500">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="block w-full  p-2 border rounded mt-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block  w-full p-2 border rounded mt-2"
          required
        />


        <Button type="submit" className="mt-3">
          Sign In
        </Button>
        <div className="flex items-center justify-center gap-1">
          <div className="text-sm mt-2">Don&apos;t Have an Account?</div>

          <Link href={'/sign-up'}>
            <div className="text-sm mt-2 text-blue-400">Sign-Up</div>
          </Link>
        </div>

      </form>
    </div>
  );
}
