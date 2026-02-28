// src/pages/LandingPage.tsx

import React, { useEffect, useRef } from 'react';
import {
  Scale,
  BookOpen,
  Search,
  Bot,
  FolderOpen,
  BarChart3,
  UserCheck,
  GraduationCap,
  Gavel,
  Shield,
  Lock,
  Target,
  Handshake,
  MessageSquare,
  FileText,
  Users,
  Mail,
  Phone,
  Globe,
  Twitter,
  Linkedin,
  Github,
  ChevronDown,
  Sparkles,
  Award,
  Brain,
  Network,
  FileCheck,
  Briefcase,
  Library,
  PenTool,
  ScrollText,
  Scale as ScaleIcon,
  HeartHandshake,
  Eye,
  TrendingUp,
  BookMarked,
  Timer,
  Calendar,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Settings,
  User,
  LogIn,
  UserPlus
} from 'lucide-react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const handleRegisterClick = () => {
    window.history.pushState({}, '', '/register');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleLoginClick = () => {
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* 1️⃣ Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-6 py-20 md:py-32 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Text Content - Animated */}
            <div className="lg:w-1/2 animate-on-scroll slide-in-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-bounce-slow">
                <Scale className="w-4 h-4 mr-2" />
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
                  className="px-10 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg text-center hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center group"
                >
                  <UserPlus className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Join the Network
                </button>
                <button
                  onClick={handleLoginClick}
                  className="px-10 py-4 border-2 border-primary/20 bg-card rounded-lg font-medium text-lg text-center hover:bg-accent transition-all duration-300 hover:scale-105 flex items-center justify-center group"
                >
                  <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Professional Sign In
                </button>
              </div>
            </div>
            
            {/* Professional Dashboard Image - Animated */}
            <div className="lg:w-1/2 relative animate-on-scroll slide-in-right animation-delay-200">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border hover:shadow-3xl transition-shadow duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 mix-blend-overlay"></div>
                {/* Dashboard Mockup */}
                <div className="bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse animation-delay-200"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse animation-delay-400"></div>
                    </div>
                    <div className="text-sm font-medium flex items-center">
                      <Gavel className="w-4 h-4 mr-2" />
                      Legal Dashboard
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="col-span-2 h-32 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 dark:text-blue-400">Active Discussions</span>
                        <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold mt-2 animate-count-up">142</div>
                      <div className="loading-bar-container mt-2">
                        <div className="h-full bg-blue-600 rounded animate-loading-bar"></div>
                      </div>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-emerald-600 dark:text-emerald-400">Contributions</span>
                        <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold mt-2 animate-count-up">24</div>
                      <div className="loading-bar-container mt-2">
                        <div className="h-full bg-emerald-600 rounded animate-loading-bar animation-delay-500"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-40 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-medium flex items-center">
                        <ScrollText className="w-4 h-4 mr-2" />
                        Recent Cases
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Updated Today
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex justify-between items-center group">
                          <div className="w-3/4 h-3 bg-slate-200 dark:bg-slate-700 rounded group-hover:bg-primary/20 transition-colors duration-300"></div>
                          <div className="w-8 h-3 bg-slate-200 dark:bg-slate-700 rounded group-hover:bg-primary/20 transition-colors duration-300"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements with Animation */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-primary/50 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* 2️⃣ Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll slide-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Professional Legal Tools
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive features designed for serious legal professionals and academics
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-background border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-on-scroll slide-in-up card-hover"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3️⃣ Who Is This For */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-on-scroll slide-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Designed for Legal Excellence
            </h2>
            <p className="text-xl text-muted-foreground">
              Tailored experiences for every stage of your legal career
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Law Students */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-10 border border-blue-200 dark:border-blue-800/50 animate-on-scroll slide-in-left">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-3xl font-display font-bold text-blue-800 dark:text-blue-300">
                  For Law Students
                </h3>
              </div>
              <ul className="space-y-6">
                {studentBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {benefit.title}
                      </h4>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* For Legal Professionals */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-10 border border-emerald-200 dark:border-emerald-800/50 animate-on-scroll slide-in-right">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-3xl font-display font-bold text-emerald-800 dark:text-emerald-300">
                  For Legal Professionals
                </h3>
              </div>
              <ul className="space-y-6">
                {professionalBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                        {benefit.title}
                      </h4>
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
            <div className="text-center mb-16 animate-on-scroll slide-in-up">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Shield className="w-4 h-4 mr-2" />
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
              {trustPrinciples.map((principle, index) => {
                const IconComponent = principle.icon;
                return (
                  <div
                    key={index}
                    className="bg-background border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-on-scroll slide-in-up"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-display font-semibold">
                        {principle.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center animate-on-scroll scale-in">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 text-primary font-medium mb-8 animate-pulse-slow">
              <Users className="w-5 h-5 mr-2" />
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
                className="px-12 py-5 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center group"
              >
                <UserPlus className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Create Professional Account
              </button>
              <button
                onClick={handleLoginClick}
                className="px-12 py-5 border-2 border-primary/30 bg-background rounded-lg font-medium text-lg hover:bg-accent transition-all duration-300 hover:scale-105 flex items-center justify-center group"
              >
                <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
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
            <div className="animate-on-scroll slide-in-up">
              <h3 className="text-2xl font-display font-bold mb-4 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-primary" />
                NyayaNet
              </h3>
              <p className="text-muted-foreground">
                Professional Legal Knowledge Network
              </p>
              <div className="flex space-x-4 mt-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:scale-110 hover:bg-primary/20 transition-all duration-300 cursor-pointer">
                  <Twitter className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:scale-110 hover:bg-primary/20 transition-all duration-300 cursor-pointer">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:scale-110 hover:bg-primary/20 transition-all duration-300 cursor-pointer">
                  <Github className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:scale-110 hover:bg-primary/20 transition-all duration-300 cursor-pointer">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            {[0, 1, 2].map((col) => (
              <div key={col} className="animate-on-scroll slide-in-up" style={{ transitionDelay: `${(col + 1) * 100}ms` }}>
                <h4 className="font-semibold text-lg mb-6">
                  {col === 0 ? 'Platform' : col === 1 ? 'Legal' : 'Connect'}
                </h4>
                <ul className="space-y-3">
                  {footerLinks[col].map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <li key={index}>
                        <a 
                          href={link.href} 
                          className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"
                        >
                          <IconComponent className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t text-center animate-on-scroll slide-in-up">
            <p className="text-muted-foreground flex items-center justify-center flex-wrap gap-2">
              <Scale className="w-4 h-4" />
              © {new Date().getFullYear()} NyayaNet. All rights reserved.
              <span className="block sm:inline text-sm">
                This platform is for educational and professional discussion purposes only.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Features data with Lucide React icons
const features = [
  {
    icon: MessageSquare,
    title: "Structured Legal Discussions",
    description: "Engage in moderated, citation-backed discussions on complex legal topics with proper categorization and searchability."
  },
  {
    icon: Search,
    title: "Advanced Law Explorer",
    description: "Comprehensive legal research tool with indexed statutes, case law, and scholarly articles across jurisdictions."
  },
  {
    icon: Bot,
    title: "AI Research Assistant",
    description: "Intelligent legal research support with source verification, citation generation, and precedent analysis."
  },
  {
    icon: FolderOpen,
    title: "Professional Workspace",
    description: "Organize case files, research notes, and references with version control and collaborative editing capabilities."
  },
  {
    icon: BarChart3,
    title: "Contribution Analytics",
    description: "Track and showcase your professional contributions, citations, and impact within the legal community."
  },
  {
    icon: UserCheck,
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

// Trust principles with Lucide React icons
const trustPrinciples = [
  {
    icon: Gavel,
    title: "No Legal Advice",
    description: "NyayaNet is a knowledge-sharing platform, not a legal advice service. All content is for educational and discussion purposes."
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description: "We adhere to strict data protection standards. Your professional data and contributions are securely managed and controlled."
  },
  {
    icon: Target,
    title: "Professional Integrity",
    description: "All discussions maintain high professional standards with verified sources and ethical discourse guidelines."
  },
  {
    icon: HeartHandshake,
    title: "Community Standards",
    description: "We foster respectful, constructive dialogue among legal professionals with moderation by subject matter experts."
  }
];

// Footer links with icons
const footerLinks = [
  [
    { label: 'Features', href: '/features', icon: Sparkles },
    { label: 'Pricing', href: '/pricing', icon: TrendingUp },
    { label: 'Documentation', href: '/documentation', icon: BookOpen },
    { label: 'API Access', href: '/api', icon: Network }
  ],
  [
    { label: 'Privacy Policy', href: '/privacy', icon: Lock },
    { label: 'Terms of Service', href: '/terms', icon: FileText },
    { label: 'Code of Conduct', href: '/code-of-conduct', icon: ScrollText },
    { label: 'Ethics Guidelines', href: '/ethics', icon: HeartHandshake }
  ],
  [
    { label: 'Contact Us', href: '/contact', icon: Mail },
    { label: 'Support', href: '/support', icon: Phone },
    { label: 'Blog', href: '/blog', icon: PenTool },
    { label: 'Community', href: '/community', icon: Users }
  ]
];

export default LandingPage;