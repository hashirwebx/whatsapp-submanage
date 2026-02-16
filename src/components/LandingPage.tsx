import React, { useState } from "react";
import {
  Menu,
  X,
  Check,
  Star,
  ArrowRight,
  Users,
  Shield,
  Zap,
  BarChart3,
  Bell,
  Globe,
  Smartphone,
  CreditCard,
  Lock,
  ChevronRight,
  PlayCircle,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LandingPageProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
  onNavigate?: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-[#FFFDF6] min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-[#FFFDF6]/95 backdrop-blur-md z-50 border-b border-[#225E56]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onNavigate?.("landing")}
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-[#225E56] rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare
                  className="text-white"
                  size={20}
                />
              </div>
              <span className="text-xl lg:text-2xl font-semibold text-[#07131D]">
                SubTrack Pro
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a
                href="#features"
                className="text-[#07131D] hover:text-[#225E56] transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-[#07131D] hover:text-[#225E56] transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-[#07131D] hover:text-[#225E56] transition-colors"
              >
                Testimonials
              </a>
              <button
                onClick={() => onNavigate?.("blog-grid")}
                className="text-[#07131D] hover:text-[#225E56] transition-colors"
              >
                Blog
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={onSignIn}
                className="px-5 py-2.5 text-[#07131D] hover:text-[#225E56] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="px-6 py-2.5 bg-[#225E56] text-white rounded-lg hover:bg-[#1b4b45] transition-all shadow-lg shadow-[#225E56]/20"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-[#225E56]/10 bg-[#FFFDF6]">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-[#07131D] hover:text-[#225E56] transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-[#07131D] hover:text-[#225E56] transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#testimonials"
                  className="text-[#07131D] hover:text-[#225E56] transition-colors"
                >
                  Testimonials
                </a>
                <button
                  onClick={() => onNavigate?.("blog-grid")}
                  className="text-left text-[#07131D] hover:text-[#225E56] transition-colors"
                >
                  Blog
                </button>
                <div className="flex flex-col gap-3 pt-4 border-t border-[#225E56]/10">
                  <button
                    onClick={onSignIn}
                    className="px-5 py-2.5 text-[#07131D] border border-[#225E56]/20 rounded-lg hover:border-[#225E56] transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onGetStarted}
                    className="px-6 py-2.5 bg-[#225E56] text-white rounded-lg hover:bg-[#1b4b45] transition-all"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, 
                rgba(0, 255, 128, 0.15) 0px, 
                rgba(0, 255, 128, 0) 2px, 
                transparent 2px, 
                transparent 25px
              )
            `,
          }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#225E56]/10 rounded-full mb-6">
              <Zap size={16} className="text-[#225E56]" />
              <span className="text-sm font-medium text-[#225E56]">
                Smart Subscription Management
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold text-[#07131D] mb-6 leading-tight">
              Take Control of Every Subscription{" "}
              <span className="text-[#225E56]"> You Pay For.</span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              A smarter way to manage recurring subscriptions.
              Stay on top of your recurring payments with smart
              reminders, clear spending insights, and full
              multi-currency support (including PKR) — all
              through simple WhatsApp conversations. No extra
              apps. No confusion.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-[#225E56] text-white rounded-xl hover:bg-[#1b4b45] transition-all shadow-xl shadow-[#225E56]/30 flex items-center justify-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-[#07131D] rounded-xl border-2 border-[#225E56]/20 hover:border-[#225E56] transition-all flex items-center justify-center gap-2">
                <PlayCircle size={20} />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-[#225E56]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-[#225E56]" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-[#225E56]" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,77,64,0.15)] border border-gray-100 overflow-hidden">
            <div className="h-6 bg-gray-50 flex items-center px-4 gap-1.5 border-b border-gray-100">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <img
              src="https://ik.imagekit.io/BakhshuTaekwondo/dashboard.png?updatedAt=1769868112787"
              alt="SubTrack Pro Dashboard Mockup"
              className="w-full h-auto object-cover select-none pointer-events-none"
            />

            {/* Subtle glass reflection overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#225E56]/10 rounded-full mb-4">
              <Star size={16} className="text-[#225E56]" />
              <span className="text-sm font-medium text-[#225E56]">
                Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#07131D] mb-4">
              Everything You Need to Stay in Control
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features designed to help you track,
              manage, and optimize all your subscriptions
              effortlessly.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-[#FFFDF6] rounded-2xl border border-[#225E56]/10 hover:border-[#225E56]/30 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#225E56] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare
                  className="text-white"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-semibold text-[#07131D] mb-3">
                WhatsApp Integration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Manage everything through simple WhatsApp
                conversations. No app downloads, no complex
                interfaces.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-[#FFFDF6] rounded-2xl border border-[#225E56]/10 hover:border-[#225E56]/30 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#225E56] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bell className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[#07131D] mb-3">
                Smart Reminders
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get notified before renewal dates. Never miss a
                payment or forget to cancel an unused
                subscription.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-[#FFFDF6] rounded-2xl border border-[#225E56]/10 hover:border-[#225E56]/30 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#225E56] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[#07131D] mb-3">
                Accurate Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Visualize your spending patterns with precision.
                Our improved analytics engine handles timezone
                adjustments and currency rates automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-[#FFFDF6] rounded-2xl border border-[#225E56]/10 hover:border-[#225E56]/30 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#225E56] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[#07131D] mb-3">
                Family Sharing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Share subscription costs with family members.
                Split bills fairly and save money together.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-[#FFFDF6] rounded-2xl border border-[#225E56]/10 hover:border-[#225E56]/30 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#225E56] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[#07131D] mb-3">
                Global Currency Support
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track subscriptions in global currencies
                including PKR (Pakistani Rupee). Features
                automatic currency conversion and localized
                formatting.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-[#FFFDF6] rounded-2xl border border-[#225E56]/10 hover:border-[#225E56]/30 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-[#225E56] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[#07131D] mb-3">
                Enterprise Security
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level encryption and security. Your
                financial data is always protected and private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#0A2D27]" >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#225E56]/20 rounded-full mb-6">
                <Zap size={16} className="text-[#225E56]" />
                <span className="text-sm font-medium text-[#225E56]">
                  Powerful Dashboard
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Complete Control at Your Fingertips
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Get a comprehensive view of all your
                subscriptions, spending trends, and upcoming
                payments in one beautiful dashboard.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="px-4 py-2 bg-[#225E56]/20 border border-[#225E56]/30 rounded-lg text-sm">
                  Real-time Sync
                </div>
                <div className="px-4 py-2 bg-[#225E56]/20 border border-[#225E56]/30 rounded-lg text-sm">
                  Smart Categories
                </div>
                <div className="px-4 py-2 bg-[#225E56]/20 border border-[#225E56]/30 rounded-lg text-sm">
                  PKR Support
                </div>
                <div className="px-4 py-2 bg-[#225E56]/20 border border-[#225E56]/30 rounded-lg text-sm">
                  Cost Optimization
                </div>
              </div>

              <button className="px-8 py-4 bg-[#225E56] text-white rounded-xl hover:bg-[#1b4b45] transition-all shadow-lg flex items-center gap-2 group">
                Explore Dashboard
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* Right: Dashboard Image */}
            <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,77,64,0.15)] border border-gray-100 overflow-hidden">
              <div className="h-6 bg-gray-50 flex items-center px-4 gap-1.5 border-b border-gray-100">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <img
                src="https://ik.imagekit.io/BakhshuTaekwondo/Subscription.png"
                alt="SubTrack Pro Dashboard Mockup"
                className="w-full h-auto object-cover select-none pointer-events-none"
              />

              {/* Subtle glass reflection overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white" >
        <div className="max-w-7xl mx-auto">
          {/* Benefit 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 lg:order-1">
              <ImageWithFallback
                src="https://ik.imagekit.io/BakhshuTaekwondo/chat.png"
                alt="Collaboration"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#225E56]/10 rounded-full mb-6">
                <TrendingUp
                  size={16}
                  className="text-[#225E56]"
                />
                <span className="text-sm font-medium text-[#225E56]">
                  Automation
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#07131D] mb-6">
                Automate & Focus on What Matters
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Let AI handle the tedious work of tracking
                renewals, comparing prices, and finding better
                deals. Spend your time on what truly matters.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#225E56]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check
                      size={14}
                      className="text-[#225E56]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-[#07131D]">
                      Automatic Tracking:
                    </span>
                    <span className="text-gray-600">
                      {" "}
                      AI detects and adds subscriptions
                      automatically
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#225E56]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check
                      size={14}
                      className="text-[#225E56]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-[#07131D]">
                      Price Monitoring:
                    </span>
                    <span className="text-gray-600">
                      {" "}
                      Get notified when better deals become
                      available
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#225E56]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check
                      size={14}
                      className="text-[#225E56]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-[#07131D]">
                      Smart Insights:
                    </span>
                    <span className="text-gray-600">
                      {" "}
                      Receive personalized recommendations to
                      save money
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#225E56]/10 rounded-full mb-6">
                <Shield size={16} className="text-[#225E56]" />
                <span className="text-sm font-medium text-[#225E56]">
                  Security
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#07131D] mb-6">
                Your Data is Always Safe & Secure
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We use enterprise-grade security measures to
                protect your financial information. Your privacy
                is our top priority.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#225E56]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check
                      size={14}
                      className="text-[#225E56]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-[#07131D]">
                      End-to-End Encryption:
                    </span>
                    <span className="text-gray-600">
                      {" "}
                      Bank-level 256-bit SSL encryption
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#225E56]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check
                      size={14}
                      className="text-[#225E56]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-[#07131D]">
                      GDPR Compliant:
                    </span>
                    <span className="text-gray-600">
                      {" "}
                      Full compliance with data protection
                      regulations
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#225E56]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check
                      size={14}
                      className="text-[#225E56]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-[#07131D]">
                      Regular Audits:
                    </span>
                    <span className="text-gray-600">
                      {" "}
                      Third-party security audits every quarter
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <ImageWithFallback
                src="https://ik.imagekit.io/BakhshuTaekwondo/secure.png?updatedAt=1769875394650"
                alt="Security"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#FFFDF6]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#225E56]/10 rounded-full mb-4">
              <CreditCard
                size={16}
                className="text-[#225E56]"
              />
              <span className="text-sm font-medium text-[#225E56]">
                Pricing
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#07131D] mb-4">
              Choose the Perfect Plan for You
            </h2>
            <p className="text-lg text-gray-600">
              Simple, transparent pricing. Start free and
              upgrade anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl p-8 border border-[#225E56]/10 hover:border-[#225E56]/30 transition-all hover:shadow-xl">
              <h3 className="text-2xl font-bold text-[#07131D] mb-2">
                Starter
              </h3>
              <p className="text-gray-600 mb-6">
                Perfect for individuals
              </p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-[#07131D]">
                  $0
                </span>
                <span className="text-gray-600">/month</span>
              </div>
              <button className="w-full px-6 py-3 bg-white text-[#225E56] border-2 border-[#225E56] rounded-xl hover:bg-[#225E56] hover:text-white transition-all mb-6">
                Get Started Free
              </button>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-[#225E56] flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600">
                    Up to 10 subscriptions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-[#225E56] flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600">
                    WhatsApp notifications
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-[#225E56] flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600">
                    Basic analytics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-[#225E56] flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600">
                    Email support
                  </span>
                </li>
              </ul>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="bg-[#225E56] rounded-2xl p-8 relative transform md:scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#07131D] text-white rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Pro
              </h3>
              <p className="text-white/80 mb-6">
                For power users
              </p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">
                  $9
                </span>
                <span className="text-white/80">/month</span>
              </div>
              <button className="w-full px-6 py-3 bg-white text-[#225E56] rounded-xl hover:bg-[#FFFDF6] transition-all mb-6 font-semibold">
                Start 14-Day Trial
              </button>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-white flex-shrink-0 mt-0.5"
                  />
                  <span className="text-white">
                    Unlimited subscriptions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-white flex-shrink-0 mt-0.5"
                  />
                  <span className="text-white">
                    Advanced analytics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-white flex-shrink-0 mt-0.5"
                  />
                  <span className="text-white">
                    Family sharing (up to 5)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-white flex-shrink-0 mt-0.5"
                  />
                  <span className="text-white">
                    AI recommendations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-white flex-shrink-0 mt-0.5"
                  />
                  <span className="text-white">
                    Priority support
                  </span>
                </li>
              </ul>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-2xl p-8 border border-[#225E56]/10 hover:border-[#225E56]/30 transition-all hover:shadow-xl">
              <h3 className="text-2xl font-bold text-[#07131D] mb-2">
                Business
              </h3>
              <p className="text-gray-600 mb-6">
                For teams & organizations
              </p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-[#07131D]">
                  $29
                </span>
                <span className="text-gray-600">/month</span>
              </div>
              <button className="w-full px-6 py-3 bg-white text-[#225E56] border-2 border-[#225E56] rounded-xl hover:bg-[#225E56] hover:text-white transition-all mb-6">
                Contact Sales
              </button>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-[#225E56] flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600">
                    Everything in Pro
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-[#225E56] flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600">
                    Unlimited team members
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-[#225E56] flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600">
                    Custom integrations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-[#225E56] flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600">
                    Dedicated account manager
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-[#225E56] flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600">
                    24/7 phone support
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#225E56]/10 rounded-full mb-4">
              <Star size={16} className="text-[#225E56]" />
              <span className="text-sm font-medium text-[#225E56]">
                Testimonials
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#07131D] mb-4">
              Loved by Thousands of Users
            </h2>
            <p className="text-lg text-gray-600">
              See what our customers have to say about SubTrack
              Pro.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-[#FFFDF6] rounded-2xl p-8 border border-[#225E56]/10 hover:shadow-xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className="fill-[#225E56] text-[#225E56]"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "SubTrack Pro saved me over $500 this year! I
                had no idea I was still paying for services I
                never used. The WhatsApp notifications are a
                game-changer."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#225E56] rounded-full flex items-center justify-center text-white font-semibold">
                  SM
                </div>
                <div>
                  <p className="font-semibold text-[#07131D]">
                    Sarah Mitchell
                  </p>
                  <p className="text-sm text-gray-600">
                    Marketing Manager
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#FFFDF6] rounded-2xl p-8 border border-[#225E56]/10 hover:shadow-xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className="fill-[#225E56] text-[#225E56]"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Finally, a subscription manager that actually
                works! The AI insights are incredibly accurate,
                and family sharing made it easy to split costs
                with my roommates."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#225E56] rounded-full flex items-center justify-center text-white font-semibold">
                  JC
                </div>
                <div>
                  <p className="font-semibold text-[#07131D]">
                    James Chen
                  </p>
                  <p className="text-sm text-gray-600">
                    Software Developer
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[#FFFDF6] rounded-2xl p-8 border border-[#225E56]/10 hover:shadow-xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className="fill-[#225E56] text-[#225E56]"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The analytics dashboard gives me complete
                visibility into my spending. I love how simple
                it is to manage everything through WhatsApp.
                Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#225E56] rounded-full flex items-center justify-center text-white font-semibold">
                  EP
                </div>
                <div>
                  <p className="font-semibold text-[#07131D]">
                    Emily Parker
                  </p>
                  <p className="text-sm text-gray-600">
                    Small Business Owner
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-[#FFFDF6] rounded-2xl p-8 border border-[#225E56]/10 hover:shadow-xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className="fill-[#225E56] text-[#225E56]"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Best investment I've made this year! The app
                paid for itself in the first month by helping me
                cancel unused subscriptions. The interface is
                beautiful too."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#225E56] rounded-full flex items-center justify-center text-white font-semibold">
                  MR
                </div>
                <div>
                  <p className="font-semibold text-[#07131D]">
                    Michael Rodriguez
                  </p>
                  <p className="text-sm text-gray-600">
                    Freelance Designer
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 5 */}
            <div className="bg-[#FFFDF6] rounded-2xl p-8 border border-[#225E56]/10 hover:shadow-xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className="fill-[#225E56] text-[#225E56]"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "I manage subscriptions for my entire family
                now. The multi-currency support is perfect since
                we have services from different countries.
                Couldn't live without it!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#225E56] rounded-full flex items-center justify-center text-white font-semibold">
                  LT
                </div>
                <div>
                  <p className="font-semibold text-[#07131D]">
                    Lisa Thompson
                  </p>
                  <p className="text-sm text-gray-600">
                    Product Manager
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 6 */}
            <div className="bg-[#FFFDF6] rounded-2xl p-8 border border-[#225E56]/10 hover:shadow-xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className="fill-[#225E56] text-[#225E56]"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Security was my main concern, but SubTrack Pro
                exceeded my expectations. Bank-level encryption
                and transparent data policies. Plus, the
                customer support is fantastic!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#225E56] rounded-full flex items-center justify-center text-white font-semibold">
                  DK
                </div>
                <div>
                  <p className="font-semibold text-[#07131D]">
                    David Kim
                  </p>
                  <p className="text-sm text-gray-600">
                    Financial Analyst
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section
        id="blog"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#225E56]/10 rounded-full mb-4">
              <MessageSquare
                size={16}
                className="text-[#225E56]"
              />
              <span className="text-sm font-medium text-[#225E56]">
                Blog & Resources
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#07131D] dark:text-[#F8F9FA] mb-4">
              Latest Blog & Articles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Tips, insights, and best practices for managing
              your subscriptions.
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Blog Post 1 */}
            <article className="bg-[#FFFDF6] dark:bg-black rounded-2xl overflow-hidden border border-[#225E56]/10 hover:shadow-xl transition-all group">
              <div className="relative h-56 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758518731706-be5d5230e5a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBkaXNjdXNzaW9ufGVufDF8fHx8MTc2OTg2NDEyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Blog Post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#225E56] text-white rounded-full text-sm font-medium">
                  Tips & Tricks
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span>Jan 28, 2026</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
                <h3 className="text-xl font-semibold text-[#07131D] dark:text-[#F8F9FA] mb-3 group-hover:text-[#225E56] transition-colors">
                  10 Ways to Save Money on Your Monthly
                  Subscriptions
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Discover proven strategies to reduce your
                  subscription costs without sacrificing the
                  services you love.
                </p>
                <button
                  onClick={() => onNavigate?.("blog-detail")}
                  className="text-[#225E56] font-medium flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Read More
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>

            {/* Blog Post 2 */}
            <article className="bg-[#FFFDF6] dark:bg-black rounded-2xl overflow-hidden border border-[#225E56]/10 hover:shadow-xl transition-all group">
              <div className="relative h-56 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1645226880663-81561dcab0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwZmluYW5jZSUyMGFwcHxlbnwxfHx8fDE3Njk4NjQxMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Blog Post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#225E56] text-white rounded-full text-sm font-medium">
                  Product Updates
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span>Jan 25, 2026</span>
                  <span>•</span>
                  <span>3 min read</span>
                </div>
                <h3 className="text-xl font-semibold text-[#07131D] dark:text-[#F8F9FA] mb-3 group-hover:text-[#225E56] transition-colors">
                  Introducing AI-Powered Smart Recommendations
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Our new AI engine helps you identify duplicate
                  services and find better deals automatically.
                </p>
                <button
                  onClick={() => onNavigate?.("blog-detail")}
                  className="text-[#225E56] font-medium flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Read More
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>

            {/* Blog Post 3 */}
            <article className="bg-[#FFFDF6] dark:bg-black rounded-2xl overflow-hidden border border-[#225E56]/10 hover:shadow-xl transition-all group">
              <div className="relative h-56 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1601509876296-aba16d4c10a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc2OTc4MDgyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Blog Post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#225E56] text-white rounded-full text-sm font-medium">
                  Guides
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span>Jan 22, 2026</span>
                  <span>•</span>
                  <span>7 min read</span>
                </div>
                <h3 className="text-xl font-semibold text-[#07131D] dark:text-[#F8F9FA] mb-3 group-hover:text-[#225E56] transition-colors">
                  How to Share Subscriptions with Your Family
                  Safely
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  A complete guide to family sharing features
                  and best practices for secure account
                  management.
                </p>
                <button
                  onClick={() => onNavigate?.("blog-detail")}
                  className="text-[#225E56] font-medium flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Read More
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          </div>

          {/* View All Button */}
          <div className="text-center">
            <button className="px-8 py-3 bg-white dark:bg-black text-[#225E56] border-2 border-[#225E56] rounded-xl hover:bg-[#225E56] hover:text-white transition-all">
              View All Articles
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#0A2D27] relative overflow-hidden" >
        <div className="absolute inset-0 bg-gradient-to-br from-[#225E56]/20 to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Subscriptions?
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Join thousands of users who are saving money and
            time with SubTrack Pro. Start your free 14-day trial
            today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-[#225E56] text-white rounded-xl hover:bg-[#1b4b45] transition-all shadow-xl flex items-center justify-center gap-2 group"
            >
              Start Your Free Trial
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-[#07131D] rounded-xl hover:bg-gray-100 transition-all">
              Schedule a Demo
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            ✓ No credit card required • ✓ 14-day free trial • ✓
            Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      < footer className="bg-[#07131D] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10" >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#225E56] rounded-xl flex items-center justify-center">
                  <MessageSquare
                    className="text-white"
                    size={20}
                  />
                </div>
                <span className="text-2xl font-semibold">
                  SubTrack Pro
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The smart way to manage your subscriptions.
                Track, optimize, and save money on all your
                recurring payments through WhatsApp.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-[#225E56] rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="sr-only">Facebook</span>
                  <span className="text-xl">f</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-[#225E56] rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <span className="text-xl">𝕏</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-[#225E56] rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="sr-only">LinkedIn</span>
                  <span className="text-xl">in</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-[#225E56] rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="sr-only">Instagram</span>
                  <span className="text-xl">IG</span>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Mobile App
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.("blog-grid")}
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Press Kit
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#225E56] transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 SubTrack Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a
                href="#"
                className="hover:text-[#225E56] transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-[#225E56] transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-[#225E56] transition-colors"
              >
                Cookies
              </a>
              <a
                href="#"
                className="hover:text-[#225E56] transition-colors"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};