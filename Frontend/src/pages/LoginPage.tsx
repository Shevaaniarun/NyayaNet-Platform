import React, { useState } from 'react';
import { loginUser } from "../api/authService";

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
    <div className="min-h-screen flex bg-justice-black">
      {/* Left Section - Desktop Only */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-constitution-gold/10 via-justice-black to-card">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient-flow">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-constitution-gold/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-drift animation-delay-1000" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-constitution-gold/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-drift animation-delay-3000" />
          <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-constitution-gold/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-drift animation-delay-5000" />
        </div>

        {/* Floating legal icons */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-20 h-24 bg-gradient-to-br from-constitution-gold/20 to-constitution-gold/5 backdrop-blur-sm rounded-lg border border-constitution-gold/20 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.8)] animate-float-legal">
            <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-constitution-gold/30"></div>
            <div className="absolute top-4 left-3 w-10 h-1 rounded-full bg-constitution-gold/20"></div>
            <div className="absolute top-7 left-3 w-14 h-1 rounded-full bg-constitution-gold/20"></div>
            <div className="absolute top-10 left-3 w-12 h-1 rounded-full bg-constitution-gold/20"></div>
          </div>

          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-constitution-gold/20 to-constitution-gold/5 backdrop-blur-sm rounded-full border border-constitution-gold/20 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.8)] animate-float-legal animation-delay-1500">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-constitution-gold/30"></div>
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-6 h-6 rounded-full bg-constitution-gold/30"></div>
            <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-6 h-6 rounded-full bg-constitution-gold/30"></div>
          </div>

          <div className="absolute bottom-32 left-32 w-20 h-24 bg-gradient-to-br from-constitution-gold/20 to-constitution-gold/5 backdrop-blur-sm rounded-lg border border-constitution-gold/20 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.8)] animate-float-legal animation-delay-2500">
            <div className="absolute top-2 left-3 w-14 h-3 rounded-lg bg-constitution-gold/30"></div>
            <div className="absolute top-8 left-3 w-14 h-1 rounded-full bg-constitution-gold/20"></div>
            <div className="absolute top-11 left-3 w-10 h-1 rounded-full bg-constitution-gold/20"></div>
          </div>

          <div className="absolute bottom-20 right-20 w-20 h-20 bg-gradient-to-br from-constitution-gold/20 to-constitution-gold/15 backdrop-blur-sm rounded-lg border border-constitution-gold/20 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.8)] animate-float-legal animation-delay-3500">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-2 bg-constitution-gold/40 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-1 h-8 bg-constitution-gold/40 rounded-full"></div>
          </div>
        </div>

        {/* Animated connection lines */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-1 bg-gradient-to-r from-constitution-gold/10 to-transparent animate-line-glow"></div>
          <div className="absolute top-40 right-32 w-40 h-1 bg-gradient-to-l from-constitution-gold/10 to-transparent animate-line-glow animation-delay-1000"></div>
          <div className="absolute bottom-32 left-32 w-40 h-1 bg-gradient-to-r from-constitution-gold/10 to-transparent animate-line-glow animation-delay-2000"></div>
        </div>

        {/* Overlay text */}
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold tracking-tight text-ivory mb-6 animate-text-reveal font-serif">
              NyayaNet
            </h1>
            <p className="text-2xl text-soft-gray leading-relaxed animate-text-reveal animation-delay-300 font-serif">
              AI-powered legal collaboration platform
              <br />
              for modern legal professionals
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:w-2/5">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile-only header */}
          <div className="lg:hidden mb-10 text-center">
            <h1 className="text-4xl font-bold text-constitution-gold mb-3 font-serif">NyayaNet</h1>
            <p className="text-soft-gray font-serif">Legal collaboration platform</p>
          </div>

          <div className="bg-justice-black/90 rounded-2xl shadow-[0_25px_100px_-25px_rgba(212,175,55,0.8)] p-10 border border-constitution-gold/20 backdrop-blur-lg">
            <h2 className="text-3xl font-bold text-constitution-gold mb-3 font-serif tracking-tight">
              Welcome Back
            </h2>
            <p className="text-soft-gray mb-10 font-serif leading-relaxed">
              Sign in to your legal workspace
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-medium text-ivory font-serif">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="professional@lawfirm.com"
                  className="w-full px-5 py-4 rounded-lg border border-constitution-gold/30 bg-justice-black text-ivory placeholder:text-soft-gray/60 focus:outline-none focus:ring-2 focus:ring-constitution-gold focus:border-transparent transition-all duration-300 hover:border-constitution-gold/50 focus:shadow-[0_0_20px_rgba(212,175,55,0.8)]"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-medium text-ivory font-serif">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-5 py-4 rounded-lg border border-constitution-gold/30 bg-justice-black text-ivory placeholder:text-soft-gray/60 focus:outline-none focus:ring-2 focus:ring-constitution-gold focus:border-transparent transition-all duration-300 hover:border-constitution-gold/50 focus:shadow-[0_0_20px_rgba(212,175,55,0.8)]"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-constitution-gold text-justice-black py-4 px-4 rounded-lg font-semibold font-serif transition-all duration-300 hover:bg-constitution-gold/90 hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.8)] focus:outline-none focus:ring-2 focus:ring-constitution-gold focus:ring-offset-2 focus:ring-offset-justice-black active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(212,175,55,0.8)]"
              >
                Sign In
              </button>

              {/* Register link */}
              <div className="text-center pt-6">
                <p className="text-sm text-soft-gray font-serif">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-constitution-gold font-semibold hover:text-constitution-gold/90 focus:outline-none focus:underline transition-colors duration-300 font-serif"
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