import React, { useState } from 'react';
import { MessageSquare, X, Menu, ChevronRight, ArrowRight, Search, Send } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SharedFooter } from './SharedFooter';

interface BlogGridProps {
  onNavigate: (page: string, params?: any) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const BlogGrid: React.FC<BlogGridProps> = ({ onNavigate, onGetStarted, onSignIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const blogPosts = [
    {
      id: 1,
      title: "Streamline Projects, Conquer Tasks, Achieve Success",
      date: "June 25, 2026",
      image: "https://images.unsplash.com/photo-1630487656049-6db93a53a7e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nJTIwb2ZmaWNlfGVufDF8fHx8MTc2OTkwMTUxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: "Roberto Miles",
      authorAvatar: "https://i.pravatar.cc/150?u=roberto"
    },
    {
      id: 2,
      title: "Task Management Made Simple, Projects Made Possible",
      date: "June 25, 2026",
      image: "https://images.unsplash.com/photo-1765648763935-6a33e91d6c8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjB3b3JraW5nJTIwb24lMjBsYXB0b3AlMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MXx8fHwxNzY5OTMxODI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: "Melody Molly",
      authorAvatar: "https://i.pravatar.cc/150?u=melody"
    },
    {
      id: 3,
      title: "Navigate Projects with Ease, Manage Tasks With Confidence",
      date: "June 25, 2026",
      image: "https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBkYXNoYm9hcmQlMjBkYXRhJTIwYW5hbHlzaXN8ZW58MXx8fHwxNzY5OTMxODI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: "Christina Allison",
      authorAvatar: "https://i.pravatar.cc/150?u=christina"
    },
    {
      id: 4,
      title: "Master tasks conquer projects achieve goals With precision.",
      date: "June 25, 2026",
      image: "https://images.unsplash.com/photo-1562577308-c8b2614b9b9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMGhpZ2glMjBmaXZlfGVufDF8fHx8MTc2OTkzMTgyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      author: "Benjamin Albert",
      authorAvatar: "https://i.pravatar.cc/150?u=benjamin"
    },
    {
        id: 5,
        title: "Precision task management: the cornerstone Of project excellence.",
        date: "June 25, 2026",
        image: "https://images.unsplash.com/photo-1601509876296-aba16d4c10a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc2OTc4MDgyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        author: "Roberto Miles",
        authorAvatar: "https://i.pravatar.cc/150?u=roberto"
      },
      {
        id: 6,
        title: "Task mastery the cornerstone of project Success and achievement",
        date: "June 25, 2026",
        image: "https://images.unsplash.com/photo-1645226880663-81561dcab0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwZmluYW5jZSUyMGFwcHxlbnwxfHx8fDE3Njk4NjQxMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        author: "Benjamin Albert",
        authorAvatar: "https://i.pravatar.cc/150?u=benjamin"
      }
  ];

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
              <span className="text-xl lg:text-2xl font-semibold">Saasi</span>
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog Grid</h1>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <span className="cursor-pointer hover:text-white" onClick={() => onNavigate('landing')}>Home</span>
                <ChevronRight size={14} />
                <span className="text-[#225E56]">Blog Grid</span>
            </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
             <div className="absolute top-10 left-10 w-64 h-64 bg-[#225E56] rounded-full blur-3xl"></div>
             <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#225E56] rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FFFDF6] dark:bg-[#202124] transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-[#07131D] dark:text-[#F8F9FA] mb-4">Latest Blog and Articles</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogPosts.map((post) => (
                    <article 
                        key={post.id} 
                        className="bg-white dark:bg-[#303134] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer group"
                        onClick={() => onNavigate('blog-detail', { id: post.id })}
                    >
                        <div className="relative h-64 overflow-hidden">
                            <ImageWithFallback 
                                src={post.image} 
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-8">
                            <div className="text-gray-500 dark:text-gray-400 text-sm mb-3">{post.date}</div>
                            <h3 className="text-xl font-bold text-[#07131D] dark:text-[#F8F9FA] mb-4 leading-tight group-hover:text-[#225E56] transition-colors">
                                {post.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-6">
                                <img 
                                    src={post.authorAvatar} 
                                    alt={post.author} 
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
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
                        <span className="text-xl font-semibold text-white">Saasi</span>
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