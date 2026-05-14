import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AuthPageProps {
  onAuthSuccess: (accessToken: string, username: string, displayName: string, userId: string) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/login`;
      console.log('Attempting login to:', url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Network error' }));
        console.log('Login error response:', data);
        setError(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Login successful');

      // Store access token in localStorage
      localStorage.setItem("justb_access_token", data.accessToken);
      localStorage.setItem("justb_username", data.username);
      localStorage.setItem("justb_display_name", data.displayName);
      localStorage.setItem("justb_user_id", data.userId);

      onAuthSuccess(data.accessToken, data.username, data.displayName, data.userId);
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      
      // Provide helpful troubleshooting info
      setError(
        `Unable to connect to server. This could mean:\n\n` +
        `• The Supabase Edge Function is not deployed\n` +
        `• There's a network connectivity issue\n` +
        `• CORS is not properly configured\n\n` +
        `Technical details: ${errorMessage}\n\n` +
        `Please check the Supabase Functions dashboard to verify the 'make-server-97cb3ddd' function is deployed and running.`
      );
      setIsLoading(false);
    }
  };

  const handleSignup = async (username: string, password: string, displayName: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-97cb3ddd/signup`;
      console.log('Attempting signup to:', url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ username, password, displayName }),
      });

      console.log('Signup response status:', response.status);
      
      const data = await response.json();
      console.log('Signup response data:', data);

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setIsLoading(false);
        return;
      }

      // After successful signup, automatically log in
      await handleLogin(username, password);
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Connection error: ${errorMessage}. The backend server may not be deployed. Please check the Supabase Edge Functions dashboard.`);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", width: "100%", background: "var(--jb-bg-auth)" }}>
      {mode === "login" ? (
        <LoginForm
          onLogin={handleLogin}
          onGuestLogin={() => handleLogin("guest", "justb2026")}
          onSwitchToSignup={() => {
            setMode("signup");
            setError(null);
          }}
          error={error}
          isLoading={isLoading}
        />
      ) : (
        <SignupForm
          onSignup={handleSignup}
          onSwitchToLogin={() => {
            setMode("login");
            setError(null);
          }}
          error={error}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}