import React, { useState } from 'react';
import { registerUser } from "../api/authService";

type RegisterPageProps = {
  onSwitchToLogin: () => void;
};

const RegisterPage = ({ onSwitchToLogin }: RegisterPageProps) => {

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [barCouncilNumber, setBarCouncilNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">("");

  // UI → Backend enum mapping
  const roleMap: Record<string, string> = {
    "Law Student": "LAW_STUDENT",
    "Lawyer": "LAWYER",
    "Judge": "JUDGE",
    "Advocate": "ADVOCATE",
    "Legal Professional": "LEGAL_PROFESSIONAL",
  };

  // Roles that require bar council number
  const requiresBarCouncil = ["Lawyer", "Judge", "Advocate"].includes(role);
  const isStudent = role === "Law Student";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await registerUser({
        fullName,
        email,
        password,
        role: roleMap[role],
        barCouncilNumber: requiresBarCouncil ? barCouncilNumber : undefined,
        experienceYears: isStudent ? 0 : (experienceYears === "" ? undefined : experienceYears),
      });

      // Save token and user info
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // Redirect to dashboard after signup
      window.location.href = "/dashboard";

    } catch (error: any) {
      alert(error.message || "Registration failed");
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
          {/* Document */}
          <div className="absolute top-20 left-20 w-20 h-24 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm rounded-lg border border-primary/20 shadow-lg animate-float-legal">
            <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-primary/30"></div>
            <div className="absolute top-4 left-3 w-10 h-1 rounded-full bg-primary/20"></div>
            <div className="absolute top-7 left-3 w-14 h-1 rounded-full bg-primary/20"></div>
            <div className="absolute top-10 left-3 w-12 h-1 rounded-full bg-primary/20"></div>
          </div>

          {/* Scales */}
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm rounded-full border border-secondary/20 shadow-lg animate-float-legal animation-delay-1500">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-secondary/30"></div>
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-6 h-6 rounded-full bg-secondary/30"></div>
            <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-6 h-6 rounded-full bg-secondary/30"></div>
          </div>

          {/* Book */}
          <div className="absolute bottom-32 left-32 w-20 h-24 bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-sm rounded-lg border border-accent/20 shadow-lg animate-float-legal animation-delay-2500">
            <div className="absolute top-2 left-3 w-14 h-3 rounded-lg bg-accent/30"></div>
            <div className="absolute top-8 left-3 w-14 h-1 rounded-full bg-accent/20"></div>
            <div className="absolute top-11 left-3 w-10 h-1 rounded-full bg-accent/20"></div>
          </div>

          {/* Gavel */}
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm rounded-lg border border-primary/20 shadow-lg animate-float-legal animation-delay-3500">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-2 bg-primary/40 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-1 h-8 bg-primary/40 rounded-full"></div>
          </div>
        </div>

        {/* Animated connection lines */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-1 bg-gradient-to-r from-primary/10 to-transparent animate-line-glow"></div>
          <div className="absolute top-40 right-32 w-40 h-1 bg-gradient-to-l from-secondary/10 to-transparent animate-line-glow animation-delay-1000"></div>
          <div className="absolute bottom-32 left-32 w-40 h-1 bg-gradient-to-r from-accent/10 to-transparent animate-line-glow animation-delay-2000"></div>
        </div>

        {/* Overlay text */}
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6 animate-text-reveal">
              NyayaNet
            </h1>
            <p className="text-2xl text-muted-foreground leading-relaxed animate-text-reveal animation-delay-300">
              AI-powered legal collaboration platform
              <br />
              for modern legal professionals
            </p>

            {/* Feature highlights */}
            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4 animate-fade-in-up animation-delay-500">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                <span className="text-foreground/80">Secure document collaboration</span>
              </div>
              <div className="flex items-center gap-4 animate-fade-in-up animation-delay-700">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow animation-delay-200" />
                <span className="text-foreground/80">AI-powered legal research</span>
              </div>
              <div className="flex items-center gap-4 animate-fade-in-up animation-delay-900">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow animation-delay-400" />
                <span className="text-foreground/80">Real-time case discussions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:w-2/5">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile-only header */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">NyayaNet</h1>
            <p className="text-muted-foreground">Legal collaboration platform</p>
          </div>

          <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border/50 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Create Account
            </h2>
            <p className="text-muted-foreground mb-8">
              Join NyayaNet's legal community
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/30"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

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
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/30"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-foreground">
                  Professional Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/30 appearance-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled>Select your role</option>
                  <option value="Law Student">Law Student</option>
                  <option value="Lawyer">Lawyer</option>
                  <option value="Judge">Judge</option>
                  <option value="Advocate">Advocate</option>
                  <option value="Legal Professional">Legal Professional</option>
                </select>
              </div>

              {/* Bar Council Number - Only for Lawyer, Judge, Advocate */}
              {requiresBarCouncil && (
                <div className="space-y-2">
                  <label htmlFor="barCouncilNumber" className="text-sm font-medium text-foreground">
                    Bar Council Number
                  </label>
                  <input
                    id="barCouncilNumber"
                    name="barCouncilNumber"
                    type="text"
                    placeholder="Enter your Bar Council Registration Number"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/30"
                    value={barCouncilNumber}
                    onChange={(e) => setBarCouncilNumber(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Experience Years - Not shown for Law Student */}
              {!isStudent && role && (
                <div className="space-y-2">
                  <label htmlFor="experienceYears" className="text-sm font-medium text-foreground">
                    Years of Experience
                  </label>
                  <input
                    id="experienceYears"
                    name="experienceYears"
                    type="number"
                    min="0"
                    placeholder="Enter your years of experience"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary/30"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value === "" ? "" : parseInt(e.target.value))}
                  />
                </div>
              )}

              {/* Terms */}
              <div className="text-xs text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 px-4 rounded-lg font-medium text-black transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                Create Account
              </button>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-primary font-medium hover:text-primary/90 focus:outline-none focus:underline transition-colors duration-300"
                  >
                    Sign in
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

export default RegisterPage;
