"use client";

import { useRegisterMutation } from "../../redux/services/authApi";
import { setAuthCookie } from "../../actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [register, { isLoading, error }] = useRegisterMutation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await register(form).unwrap();
      await setAuthCookie(res.token);
      router.push("/home");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="firstName"
          type="text"
          className="w-full p-2 border rounded"
          placeholder="First Name"
          onChange={handleChange}
        />
        <input
          name="lastName"
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Last Name"
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          className="w-full p-2 border rounded"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          className="w-full p-2 border rounded"
          placeholder="Password"
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Sign Up"}
        </button>
        {error && <p className="text-red-500 text-sm">Registration failed.</p>}
      </form>
    </div>
  );
}
