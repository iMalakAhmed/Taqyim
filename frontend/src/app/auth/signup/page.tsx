"use client";

import { useRegisterMutation } from "../../redux/services/authApi";
import { setAuthCookie } from "../../actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "../../redux/services/authApi";

export default function SignupPage() {
  const [register, { isLoading: isRegistering, error: registerError }] = useRegisterMutation();
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

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await register(form).unwrap();
      await setAuthCookie(res.token);
      router.push("/home");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  // --- Temporary Login Form Logic ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [login, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ email: loginEmail, password: loginPassword }).unwrap();
      await setAuthCookie(res.token);
      console.log("Login successful, token:", res.token);
      router.push("/home");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };
  // --- End Temporary Login Form Logic ---

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Sign Up</h1>
      <form onSubmit={handleRegistrationSubmit} className="space-y-4">
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
          disabled={isRegistering}
        >
          {isRegistering ? "Registering..." : "Sign Up"}
        </button>
        {registerError && <p className="text-red-500 text-sm">Registration failed.</p>}
      </form>

      {/* --- Temporary Login Form --- */}
      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4">Test Login</h2>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
          {loginError && <p className="text-red-500 text-sm">Login failed.</p>}
        </form>
      </div>
      {/* --- End Temporary Login Form --- */}

    </div>
  );
}
