import React, { useState } from 'react';
import { MessageSquare, X, Menu, ChevronRight, Check, Facebook, Twitter, Linkedin, Instagram, Send, Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BlogDetailProps {
  onNavigate: (page: string, params?: any) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ onNavigate, onGetStarted, onSignIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-[#FFFDF6] dark:bg-[#202124] min-h-screen font-sans transition-colors duration-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-[#07131D] dark:bg-[#07131D] text-white z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-[#225E56] rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="text-white" size={20} />
              </div>
              <span className="text-xl lg:text-2xl font-semibold">SubTrack Pro</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => onNavigate('landing')} className="text-white/80 hover:text-[#225E56] transition-colors">Home</button>
              <button className="text-white/80 hover:text-[#225E56] transition-colors">Features</button>
              <button className="text-white/80 hover:text-[#225E56] transition-colors">Pricing</button>
              <button onClick={() => onNavigate('blog-grid')} className="text-[#225E56] transition-colors">Blog</button>
              <button className="text-white/80 hover:text-[#225E56] transition-colors">Contact</button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <button 
                onClick={onGetStarted}
                className="px-6 py-2.5 bg-[#225E56] text-white rounded-lg hover:bg-[#1b4b45] transition-all shadow-lg shadow-[#225E56]/20"
              >
                Get Early Access
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/10 bg-[#07131D]">
              <div className="flex flex-col gap-4">
                <button onClick={() => onNavigate('landing')} className="text-left text-white/80 hover:text-[#225E56]">Home</button>
                <button className="text-left text-white/80 hover:text-[#225E56]">Features</button>
                <button className="text-left text-white/80 hover:text-[#225E56]">Pricing</button>
                <button onClick={() => onNavigate('blog-grid')} className="text-left text-[#225E56]">Blog</button>
                <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                  <button 
                    onClick={onGetStarted}
                    className="px-6 py-2.5 bg-[#225E56] text-white rounded-lg hover:bg-[#1b4b45] transition-all"
                  >
                    Get Early Access
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Header Section */}
      <section className="bg-[#07131D] pt-40 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog Details</h1>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <span className="cursor-pointer hover:text-white" onClick={() => onNavigate('landing')}>Home</span>
                <ChevronRight size={14} />
                <span className="cursor-pointer hover:text-white" onClick={() => onNavigate('blog-grid')}>Blog Grid</span>
                <ChevronRight size={14} />
                <span className="text-[#225E56]">Streamline Projects...</span>
            </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
             <div className="absolute top-10 right-10 w-64 h-64 bg-[#225E56] rounded-full blur-3xl"></div>
             <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#225E56] rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FFFDF6] dark:bg-[#202124] transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
            {/* Hero Image */}
            <div className="rounded-2xl overflow-hidden mb-12 shadow-xl">
                <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1630487656049-6db93a53a7e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nJTIwb2ZmaWNlfGVufDF8fHx8MTc2OTkwMTUxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Team meeting"
                    className="w-full h-auto"
                />
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-b border-gray-200 dark:border-gray-700 mb-10 text-sm">
                <div className="flex items-center gap-8">
                    <div>
                        <span className="block text-gray-500 dark:text-gray-400 mb-1">Post :</span>
                        <span className="font-semibold text-[#07131D] dark:text-[#F8F9FA]">Roberto Miles</span>
                    </div>
                    <div>
                        <span className="block text-gray-500 dark:text-gray-400 mb-1">Date :</span>
                        <span className="font-semibold text-[#07131D] dark:text-[#F8F9FA]">June 25, 2026</span>
                    </div>
                    <div>
                        <span className="block text-gray-500 dark:text-gray-400 mb-1">Category :</span>
                        <span className="font-semibold text-[#07131D] dark:text-[#F8F9FA]">Human Resource</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#225E56] hover:text-white hover:border-[#225E56] transition-all">
                        <Facebook size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#225E56] hover:text-white hover:border-[#225E56] transition-all">
                        <Twitter size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#225E56] hover:text-white hover:border-[#225E56] transition-all">
                        <Linkedin size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#225E56] hover:text-white hover:border-[#225E56] transition-all">
                        <Instagram size={14} />
                    </button>
                </div>
            </div>

            {/* Article Body */}
            <article className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400">
                <h2 className="text-3xl md:text-4xl font-bold text-[#07131D] dark:text-[#F8F9FA] mb-6 leading-tight">
                    Streamline Projects, Conquer Tasks, Achieve Success
                </h2>
                <p className="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                    Welcome to a realm where creativity finds its ultimate playground, where ideas intersect with insights and innovation knows no bounds. Here, at the nexus of imagination and ingenuity, we thrive on the collision of diverse perspectives and boundless possibilities. Our space is a melting pot of creativity, where every spark ignites new.
                </p>
                <p className="mb-10 leading-relaxed text-gray-600 dark:text-gray-400">
                    Paths and every idea finds its perfect canvas. From brainstorming sessions that pulse with energy to collaborative efforts that redefine the status quo, we're driven by the relentless pursuit of innovation. Step into our world, where creativity doesn't just collide – it reshapes, redefines, and revolutionizes.
                </p>

                {/* Quote Block */}
                <div className="bg-white dark:bg-[#303134] border border-gray-100 dark:border-gray-700 p-8 rounded-xl my-10 flex gap-6 shadow-sm">
                    <div className="flex-shrink-0 text-[#e87c53]">
                        <Quote size={40} className="fill-current" />
                    </div>
                    <div>
                        <p className="text-xl font-medium text-[#07131D] dark:text-[#F8F9FA] italic mb-2">
                            "Take control of your projects and unleash your team's full potential with our powerful task management platform. Seamlessly plan, prioritize, and track tasks in real-time."
                        </p>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-[#07131D] dark:text-[#F8F9FA] mb-4 mt-12">
                    Task Mastery for Project Excellence
                </h3>
                <p className="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                    Welcome to a realm where creativity finds its ultimate playground, where ideas intersect with insights and innovation knows no bounds. Here, at the nexus of imagination and ingenuity, we thrive on the collision of diverse perspectives and boundless possibilities. Our space is a melting pot of creativity, where every spark ignites new.
                </p>
                <p className="mb-10 leading-relaxed text-gray-600 dark:text-gray-400">
                    Paths and every idea finds its perfect canvas. From brainstorming sessions that pulse with energy to collaborative efforts that redefine the status quo, we're driven by the relentless pursuit of innovation. Step into our world, where creativity doesn't just collide – it reshapes, redefines, and revolutionizes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                    <div className="rounded-xl overflow-hidden h-64">
                        <ImageWithFallback 
                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwd29ya2luZ3xlbnwxfHx8fDE3Njk5NDQ1Njl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                            alt="Team working"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="rounded-xl overflow-hidden h-64">
                         <ImageWithFallback 
                            src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXp6bGUlMjB0ZWFtfGVufDF8fHx8MTc2OTk0NDU2OXww&ixlib=rb-4.1.0&q=80&w=1080"
                            alt="Team collaboration"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-[#07131D] dark:text-[#F8F9FA] mb-4 mt-12">
                    Introducing Our Project Management Solution
                </h3>
                <p className="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                    In today's fast-paced world, effective project management is essential for success. Our comprehensive project management solution is designed to streamline your workflows, enhance collaboration, and drive project success from start to finish.
                </p>
                <p className="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                    Whether you're managing a small team or overseeing complex projects, our project management solution is your all-in-one toolkit for success. Empower your team, streamline your workflows, and achieve your project goals with confidence.
                </p>

                <ul className="space-y-4 mb-10">
                    <li className="flex items-start gap-3">
                        <span className="font-bold text-[#07131D] dark:text-[#F8F9FA] mt-1">• Task Management :</span>
                        <span>Easily create, assign, and track tasks in one centralized platform. With customizable task lists, deadlines, and priorities, you can stay organized and ensure nothing falls through the cracks.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="font-bold text-[#07131D] dark:text-[#F8F9FA] mt-1">• Team Collaboration :</span>
                        <span>Foster collaboration among team members with real-time communication tools. Share updates, files, and feedback seamlessly, keeping everyone aligned and informed throughout the project lifecycle.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="font-bold text-[#07131D] dark:text-[#F8F9FA] mt-1">• Time Tracking :</span>
                        <span>Monitor project progress and resource allocation with built-in time tracking features. Gain valuable insights into how time is being spent, identify bottlenecks, and optimize workflows for greater efficiency.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="font-bold text-[#07131D] dark:text-[#F8F9FA] mt-1">• Resource Management :</span>
                        <span>Easily allocate resources, manage workloads, and ensure that teams have the right skills and capacity to complete their tasks. Avoid burnout and optimize resource utilization for maximum productivity.</span>
                    </li>
                </ul>
            </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#07131D] py-20 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Unlock the power of Seamless Software Solutions</h2>
                <div className="flex justify-center">
                    <button onClick={onGetStarted} className="px-8 py-3 bg-[#e87c53] text-white font-medium rounded-full hover:bg-[#d66a42] transition-colors">
                        Start Now With Us
                    </button>
                </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full">
               <div className="absolute bottom-0 right-0 w-full h-1/2 bg-[#225E56]/10 transform -skew-y-3"></div>
          </div>
      </section>

      {/* Footer */}
      <section className="bg-[#07131D] py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <MessageSquare className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-semibold text-white">SubTrack Pro</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">
                        Human resources is an integral part Of any organization
                    </p>
                    <div className="flex gap-3">
                         {[1, 2, 3, 4].map((i) => (
                             <div key={i} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#225E56] hover:text-white transition-colors cursor-pointer">
                                 <span className="text-xs">In</span>
                             </div>
                         ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-6">Quick links</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="hover:text-[#225E56] cursor-pointer">Features</li>
                        <li className="hover:text-[#225E56] cursor-pointer">Pricing Plan</li>
                        <li className="hover:text-[#225E56] cursor-pointer">Integrations</li>
                        <li className="hover:text-[#225E56] cursor-pointer">Testimonial</li>
                        <li className="hover:text-[#225E56] cursor-pointer">Blog & News</li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-6">Resources</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="hover:text-[#225E56] cursor-pointer" onClick={() => onNavigate('landing')}>Home</li>
                        <li className="hover:text-[#225E56] cursor-pointer">Style Guide</li>
                        <li className="hover:text-[#225E56] cursor-pointer">License</li>
                        <li className="hover:text-[#225E56] cursor-pointer">Changelog</li>
                        <li className="hover:text-[#225E56] cursor-pointer">Contact</li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-6">Subscribe</h4>
                    <div className="relative">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder-gray-500 focus:outline-none focus:border-[#225E56]"
                        />
                        <button className="absolute right-1 top-1 w-10 h-10 bg-[#e87c53] rounded-full flex items-center justify-center text-white hover:bg-[#d66a42] transition-colors">
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <input type="checkbox" id="terms" className="rounded border-white/20 bg-transparent" />
                        <label htmlFor="terms" className="text-xs text-gray-400">I agree with the terms and conditions</label>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <div>© 2024, All Rights Reserved.</div>
                <div className="flex gap-6">
                    <span className="cursor-pointer hover:text-white">Terms of Service</span>
                    <span className="cursor-pointer hover:text-white">Privacy Policy</span>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};