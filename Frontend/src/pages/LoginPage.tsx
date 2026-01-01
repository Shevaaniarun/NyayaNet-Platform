import React, { useState } from 'react';
import { loginUser } from "../api/authAPI";

type LoginPageProps = {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void; // 🔹 ADDED
};

const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToRegister,
  onLoginSuccess, // 🔹 ADDED
}) => {

  // 🔹 ADDED: form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔹 MODIFIED: real submit logic
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await loginUser({
        email,
        password,
      });

      // Save token and user info
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // Notify app we are logged in
      onLoginSuccess();
    } catch (error: any) {
      alert(error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Section - Desktop Only */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-card">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient-flow">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-drift animation-delay-1000" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-drift animation-delay-3000" />
          <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-drift animation-delay-5000" />
        </div>

        {/* Floating legal icons */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-20 h-24 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm rounded-lg border border-primary/20 shadow-lg animate-float-legal">
            <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-primary/30"></div>
            <div className="absolute top-4 left-3 w-10 h-1 rounded-full bg-primary/20"></div>
            <div className="absolute top-7 left-3 w-14 h-1 rounded-full bg-primary/20"></div>
            <div className="absolute top-10 left-3 w-12 h-1 rounded-full bg-primary/20"></div>
          </div>

          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm rounded-full border border-secondary/20 shadow-lg animate-float-legal animation-delay-1500">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-secondary/30"></div>
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-6 h-6 rounded-full bg-secondary/30"></div>
            <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-6 h-6 rounded-full bg-secondary/30"></div>
          </div>

          <div className="absolute bottom-32 left-32 w-20 h-24 bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-sm rounded-lg border border-accent/20 shadow-lg animate-float-legal animation-delay-2500">
            <div className="absolute top-2 left-3 w-14 h-3 rounded-lg bg-accent/30"></div>
            <div className="absolute top-8 left-3 w-14 h-1 rounded-full bg-accent/20"></div>
            <div className="absolute top-11 left-3 w-10 h-1 rounded-full bg-accent/20"></div>
          </div>

          <div className="absolute bottom-20 right-20 w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm rounded-lg border border-primary/20 shadow-lg animate-float-legal animation-delay-3500">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-2 bg-primary/40 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-1 h-8 bg-primary/40 rounded-full"></div>
          </div>
        </div>

        {/* Overlay text */}
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6">
              NyayaNet
            </h1>
            <p className="text-2xl text-muted-foreground leading-relaxed">
              AI-powered legal collaboration platform
              <br />
              for modern legal professionals
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:w-2/5">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border/50 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-muted-foreground mb-8">
              Sign in to your legal workspace
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="professional@lawfirm.com"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/30"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/30"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full btn-primary py-3 px-4 rounded-lg font-medium text-black transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>

              {/* Register link */}
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-primary font-medium hover:text-primary/90 focus:outline-none focus:underline transition-colors duration-300"
                  >
                    Register
                  </button>
                </p>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
