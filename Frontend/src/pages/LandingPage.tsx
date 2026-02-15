// src/pages/LandingPage.tsx

import React from 'react';

const LandingPage: React.FC = () => {
  const handleRegisterClick = () => {
    window.history.pushState({}, '', '/register');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleLoginClick = () => {
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1️⃣ Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container mx-auto px-6 py-20 md:py-32 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Text Content */}
            <div className="lg:w-1/2">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                Professional Legal Platform
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-8 leading-tight">
                NyayaNet
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-2xl">
                A professional knowledge network connecting law students, advocates, and legal professionals through structured discourse and collaborative research.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={handleRegisterClick}
                  className="px-10 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg text-center hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Join the Network
                </button>
                <button
                  onClick={handleLoginClick}
                  className="px-10 py-4 border-2 border-primary/20 bg-card rounded-lg font-medium text-lg text-center hover:bg-accent transition-all duration-300"
                >
                  Professional Sign In
                </button>
              </div>
            </div>
            
            {/* Professional Dashboard Image */}
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 mix-blend-overlay"></div>
                {/* Dashboard Mockup */}
                <div className="bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm font-medium">Legal Dashboard</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="col-span-2 h-32 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4">
                      <div className="text-sm text-blue-600 dark:text-blue-400">Active Discussions</div>
                      <div className="text-2xl font-bold mt-2">142</div>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg p-4">
                      <div className="text-sm text-emerald-600 dark:text-emerald-400">Contributions</div>
                      <div className="text-2xl font-bold mt-2">24</div>
                    </div>
                  </div>
                  
                  <div className="h-40 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-medium">Recent Cases</div>
                      <div className="text-xs text-muted-foreground">Updated Today</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="w-3/4 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="w-8 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-2/3 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="w-8 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Professional Legal Tools
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive features designed for serious legal professionals and academics
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-background border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-semibold mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3️⃣ Who Is This For */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Designed for Legal Excellence
            </h2>
            <p className="text-xl text-muted-foreground">
              Tailored experiences for every stage of your legal career
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Law Students */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-10 border border-blue-200 dark:border-blue-800/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-2xl">
                  🎓
                </div>
                <h3 className="text-3xl font-display font-bold text-blue-800 dark:text-blue-300">
                  For Law Students
                </h3>
              </div>
              <ul className="space-y-6">
                {studentBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{benefit.title}</h4>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* For Legal Professionals */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-10 border border-emerald-200 dark:border-emerald-800/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-2xl">
                  ⚖️
                </div>
                <h3 className="text-3xl font-display font-bold text-emerald-800 dark:text-emerald-300">
                  For Legal Professionals
                </h3>
              </div>
              <ul className="space-y-6">
                {professionalBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{benefit.title}</h4>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ Trust & Ethics Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Professional Standards
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Trust & Ethical Framework
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our commitment to professional integrity and responsible legal discourse
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trustPrinciples.map((principle, index) => (
                <div
                  key={index}
                  className="bg-background border border-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                      {principle.icon}
                    </div>
                    <h3 className="text-2xl font-display font-semibold">
                      {principle.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 text-primary font-medium mb-8">
              Join the Legal Community
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
              Start Your Professional Journey
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with peers, contribute to legal knowledge, and build your professional reputation in a trusted environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={handleRegisterClick}
                className="px-12 py-5 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Create Professional Account
              </button>
              <button
                onClick={handleLoginClick}
                className="px-12 py-5 border-2 border-primary/30 bg-background rounded-lg font-medium text-lg hover:bg-accent transition-all duration-300"
              >
                Access Existing Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ Footer */}
      <footer className="border-t bg-card/30">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-display font-bold mb-4">NyayaNet</h3>
              <p className="text-muted-foreground">
                Professional Legal Knowledge Network
              </p>
              <div className="flex space-x-4 mt-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  📘
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  ⚖️
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  🎓
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Platform</h4>
              <ul className="space-y-3">
                <li><a href="/features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="/documentation" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="/api" className="text-muted-foreground hover:text-primary transition-colors">API Access</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Legal</h4>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="/code-of-conduct" className="text-muted-foreground hover:text-primary transition-colors">Code of Conduct</a></li>
                <li><a href="/ethics" className="text-muted-foreground hover:text-primary transition-colors">Ethics Guidelines</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Connect</h4>
              <ul className="space-y-3">
                <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="/support" className="text-muted-foreground hover:text-primary transition-colors">Support</a></li>
                <li><a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
                <li><a href="/community" className="text-muted-foreground hover:text-primary transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} NyayaNet. All rights reserved. 
              <span className="block sm:inline"> This platform is for educational and professional discussion purposes only.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Features data
const features = [
  {
    icon: "💬",
    title: "Structured Legal Discussions",
    description: "Engage in moderated, citation-backed discussions on complex legal topics with proper categorization and searchability."
  },
  {
    icon: "🔍",
    title: "Advanced Law Explorer",
    description: "Comprehensive legal research tool with indexed statutes, case law, and scholarly articles across jurisdictions."
  },
  {
    icon: "🤖",
    title: "AI Research Assistant",
    description: "Intelligent legal research support with source verification, citation generation, and precedent analysis."
  },
  {
    icon: "📁",
    title: "Professional Workspace",
    description: "Organize case files, research notes, and references with version control and collaborative editing capabilities."
  },
  {
    icon: "📊",
    title: "Contribution Analytics",
    description: "Track and showcase your professional contributions, citations, and impact within the legal community."
  },
  {
    icon: "👤",
    title: "Verified Professional Profile",
    description: "Establish your professional identity with verified credentials, publications, and peer endorsements."
  }
];

// Benefits data
const studentBenefits = [
  {
    title: "Practical Learning",
    description: "Apply theoretical knowledge to real legal scenarios through structured case discussions."
  },
  {
    title: "Mentorship Access",
    description: "Connect with experienced legal professionals for guidance and career advice."
  },
  {
    title: "Portfolio Development",
    description: "Build a professional portfolio of contributions recognized by legal institutions."
  }
];

const professionalBenefits = [
  {
    title: "Knowledge Sharing",
    description: "Contribute to legal scholarship while establishing thought leadership in your practice area."
  },
  {
    title: "Networking Platform",
    description: "Connect with peers across specialties and jurisdictions for collaboration and referrals."
  },
  {
    title: "Research Efficiency",
    description: "Access curated legal resources and collaborative research tools to enhance practice efficiency."
  }
];

// Trust principles
const trustPrinciples = [
  {
    icon: "⚖️",
    title: "No Legal Advice",
    description: "NyayaNet is a knowledge-sharing platform, not a legal advice service. All content is for educational and discussion purposes."
  },
  {
    icon: "🔒",
    title: "Data Privacy",
    description: "We adhere to strict data protection standards. Your professional data and contributions are securely managed and controlled."
  },
  {
    icon: "🎯",
    title: "Professional Integrity",
    description: "All discussions maintain high professional standards with verified sources and ethical discourse guidelines."
  },
  {
    icon: "🤝",
    title: "Community Standards",
    description: "We foster respectful, constructive dialogue among legal professionals with moderation by subject matter experts."
  }
];

export default LandingPage;