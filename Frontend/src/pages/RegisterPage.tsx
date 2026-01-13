import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { registerUser } from "../api/authAPI";

type RegisterPageProps = {
  onSwitchToLogin: () => void;
};

const RegisterPage = ({ onSwitchToLogin }: RegisterPageProps) => {

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [barCouncilNumber, setBarCouncilNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">("");

  const roleMap: Record<string, string> = {
    "Law Student": "LAW_STUDENT",
    "Lawyer": "LAWYER",
    "Judge": "JUDGE",
    "Advocate": "ADVOCATE",
    "Legal Professional": "LEGAL_PROFESSIONAL",
  };

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

      localStorage.setItem("token", result.token);

      toast.success('Registration successful! Redirecting to dashboard...', {
        duration: 2000,
        style: {
          background: '#0A0A0A',
          color: '#D4AF37',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px',
          fontFamily: 'serif',
        },
        iconTheme: {
          primary: '#D4AF37',
          secondary: '#0A0A0A',
        },
      });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);

    } catch (error: any) {
      const errorMessage = error.message || "Registration failed. Please check your information.";
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#0A0A0A',
          color: '#D4AF37',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px',
          fontFamily: 'serif',
        },
        iconTheme: {
          primary: '#D4AF37',
          secondary: '#0A0A0A',
        },
      });
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#0A0A0A',
            color: '#D4AF37',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            fontFamily: 'serif',
          },
        }}
      />
      <div className="min-h-screen flex bg-justice-black">
        <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-constitution-gold/10 via-justice-black to-card">
          <div className="absolute inset-0 animate-gradient-flow">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-constitution-gold/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-drift animation-delay-1000" />
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-constitution-gold/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-drift animation-delay-3000" />
            <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-constitution-gold/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-drift animation-delay-5000" />
          </div>

          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-20 h-24 bg-gradient-to-br from-constitution-gold/20 to-constitution-gold/5 backdrop-blur-sm rounded-lg border border-constitution-gold/20 shadow-[0_10px_30px_-5px_rgba(212,175,55,0.4),0_20px_60px_-15px_rgba(212,175,55,0.8)] animate-float-legal">
              <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-constitution-gold/30"></div>
              <div className="absolute top-4 left-3 w-10 h-1 rounded-full bg-constitution-gold/20"></div>
              <div className="absolute top-7 left-3 w-14 h-1 rounded-full bg-constitution-gold/20"></div>
              <div className="absolute top-10 left-3 w-12 h-1 rounded-full bg-constitution-gold/20"></div>
            </div>
            
            <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-constitution-gold/20 to-constitution-gold/5 backdrop-blur-sm rounded-full border border-constitution-gold/20 shadow-[0_10px_30px_-5px_rgba(212,175,55,0.4),0_20px_60px_-15px_rgba(212,175,55,0.8)] animate-float-legal animation-delay-1500">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-constitution-gold/30"></div>
              <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-6 h-6 rounded-full bg-constitution-gold/30"></div>
              <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-6 h-6 rounded-full bg-constitution-gold/30"></div>
            </div>
            
            <div className="absolute bottom-32 left-32 w-20 h-24 bg-gradient-to-br from-constitution-gold/20 to-constitution-gold/5 backdrop-blur-sm rounded-lg border border-constitution-gold/20 shadow-[0_10px_30px_-5px_rgba(212,175,55,0.4),0_20px_60px_-15px_rgba(212,175,55,0.8)] animate-float-legal animation-delay-2500">
              <div className="absolute top-2 left-3 w-14 h-3 rounded-lg bg-constitution-gold/30"></div>
              <div className="absolute top-8 left-3 w-14 h-1 rounded-full bg-constitution-gold/20"></div>
              <div className="absolute top-11 left-3 w-10 h-1 rounded-full bg-constitution-gold/20"></div>
            </div>

            <div className="absolute bottom-20 right-20 w-20 h-20 bg-gradient-to-br from-constitution-gold/20 to-constitution-gold/15 backdrop-blur-sm rounded-lg border border-constitution-gold/20 shadow-[0_10px_30px_-5px_rgba(212,175,55,0.4),0_20px_60px_-15px_rgba(212,175,55,0.8)] animate-float-legal animation-delay-3500">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-2 bg-constitution-gold/40 rounded-full"></div>
              <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-1 h-8 bg-constitution-gold/40 rounded-full"></div>
            </div>
          </div>

          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-40 h-1 bg-gradient-to-r from-constitution-gold/10 to-transparent animate-line-glow"></div>
            <div className="absolute top-40 right-32 w-40 h-1 bg-gradient-to-l from-constitution-gold/10 to-transparent animate-line-glow animation-delay-1000"></div>
            <div className="absolute bottom-32 left-32 w-40 h-1 bg-gradient-to-r from-constitution-gold/10 to-transparent animate-line-glow animation-delay-2000"></div>
          </div>

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
              
              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-4 animate-fade-in-up animation-delay-500">
                  <div className="w-2 h-2 rounded-full bg-constitution-gold animate-pulse-glow" />
                  <span className="text-ivory/90 font-serif">Secure document collaboration</span>
                </div>
                <div className="flex items-center gap-4 animate-fade-in-up animation-delay-700">
                  <div className="w-2 h-2 rounded-full bg-constitution-gold animate-pulse-glow animation-delay-200" />
                  <span className="text-ivory/90 font-serif">AI-powered legal research</span>
                </div>
                <div className="flex items-center gap-4 animate-fade-in-up animation-delay-900">
                  <div className="w-2 h-2 rounded-full bg-constitution-gold animate-pulse-glow animation-delay-400" />
                  <span className="text-ivory/90 font-serif">Real-time case discussions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:w-2/5">
          <div className="w-full max-w-md animate-fade-in">
            <div className="bg-justice-black/90 rounded-2xl shadow-[0_15px_50px_-10px_rgba(212,175,55,0.5),0_25px_100px_-25px_rgba(212,175,55,0.8)] p-10 border border-constitution-gold/20 backdrop-blur-lg">
              <h2 className="text-3xl font-bold text-constitution-gold mb-3 font-serif tracking-tight">
                Create Account
              </h2>
              <p className="text-soft-gray mb-10 font-serif leading-relaxed">
                Join NyayaNet's exclusive legal community
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-ivory font-serif">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 rounded-lg border border-constitution-gold/30 bg-justice-black text-ivory placeholder:text-soft-gray/60 focus:ring-2 focus:ring-constitution-gold focus:shadow-[0_0_20px_rgba(212,175,55,0.7)]"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-ivory font-serif">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-5 py-4 rounded-lg border border-constitution-gold/30 bg-justice-black text-ivory placeholder:text-soft-gray/60 focus:ring-2 focus:ring-constitution-gold focus:shadow-[0_0_20px_rgba(212,175,55,0.7)]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-ivory font-serif">Password</label>
                  <input
                    type="password"
                    className="w-full px-5 py-4 rounded-lg border border-constitution-gold/30 bg-justice-black text-ivory placeholder:text-soft-gray/60 focus:ring-2 focus:ring-constitution-gold focus:shadow-[0_0_20px_rgba(212,175,55,0.7)]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-ivory font-serif">Professional Role</label>
                  <select
                    className="w-full px-5 py-4 rounded-lg border border-constitution-gold/30 bg-justice-black text-ivory focus:ring-2 focus:ring-constitution-gold focus:shadow-[0_0_20px_rgba(212,175,55,0.7)]"
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

                <div className="text-xs text-muted-foreground">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </div>

                <button
                  type="submit"
                  className="w-full bg-constitution-gold text-justice-black py-4 rounded-lg font-semibold shadow-[0_10px_30px_-10px_rgba(212,175,55,0.8)] hover:bg-constitution-gold/90"
                >
                  Create Account
                </button>

                <div className="text-center">
                  <p className="text-sm text-soft-gray font-serif">
                    Already have an account?{" "}
                    <button onClick={onSwitchToLogin} className="text-constitution-gold font-semibold">
                      Sign in
                    </button>
                  </p>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;