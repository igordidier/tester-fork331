"use client";

import { useState, useEffect } from "react";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const supabaseClient = useSupabaseClient();
  const { session } = useSessionContext();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("artist");

  useEffect(() => {
    if (session) {
      console.log("Session detected:", session);
      router.push("/");
    }
  }, [session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        console.log("Attempting sign up with data:", { email, firstName, lastName, phoneNumber, role });
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone_number: phoneNumber,
              role,
            },
          },
        });
        if (error) {
          console.error("Sign-up error:", error);
          throw error;
        }
        console.log("Sign-up successful:", data);
        alert("Check your email for the confirmation link!");
        
        // Fetch and log the user data to verify it was saved correctly
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError) {
          console.error("Error fetching user data:", userError);
        } else {
          console.log("User data after sign-up:", userData);
        }
      } else {
        console.log("Attempting sign in with email:", email);
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error("Sign-in error:", error);
          throw error;
        }
        console.log("Sign-in successful:", data);
        
        // Fetch and log the user metadata after sign-in
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError) {
          console.error("Error fetching user data:", userError);
        } else {
          console.log("User metadata after sign-in:", userData.user.user_metadata);
        }
        
        router.push("/");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert(error.message);
    }
  };

  const toggleAuthMode = () => setIsSignUp(!isSignUp);

  return (
    <div className="grid grid-cols-2 items-center min-h-screen">
      <div className="w-full h-full bg-slate-900"></div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">{isSignUp ? "Create an account" : "Welcome back"}</h1>
          <p className="text-gray-500">
            {isSignUp ? "Sign up to get started" : "Sign in to your account to continue"}
          </p>
          <form onSubmit={handleSubmit} className="w-[350px] space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            {isSignUp && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="artist">Artist</option>
                  <option value="manager">Manager</option>
                </select>
              </>
            )}
            <button
              type="submit"
              className="w-full p-2 bg-[#0D121F] text-white rounded hover:bg-[#8057f0]"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>
          <p className="text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={toggleAuthMode}
              className="ml-1 text-[#8057f0] hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;