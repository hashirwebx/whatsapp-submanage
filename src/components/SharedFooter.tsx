import React from 'react';
import { MessageSquare } from 'lucide-react';

export const SharedFooter: React.FC = () => {
  return (
    <footer className="bg-[#07131D] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#225E56] rounded-xl flex items-center justify-center">
                <MessageSquare className="text-white" size={20} />
              </div>
              <span className="text-2xl font-semibold">SubTrack Pro</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The smart way to manage your subscriptions. Track, optimize, and save money on all your recurring payments through WhatsApp.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#225E56] rounded-lg flex items-center justify-center transition-colors">
                <span className="sr-only">Facebook</span>
                <span className="text-xl">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#225E56] rounded-lg flex items-center justify-center transition-colors">
                <span className="sr-only">Twitter</span>
                <span className="text-xl">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#225E56] rounded-lg flex items-center justify-center transition-colors">
                <span className="sr-only">LinkedIn</span>
                <span className="text-xl">in</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#225E56] rounded-lg flex items-center justify-center transition-colors">
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
                <a href="/#features" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/#pricing" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Mobile App
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
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
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Press Kit
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
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
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#225E56] transition-colors">
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
            <a href="#" className="hover:text-[#225E56] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[#225E56] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[#225E56] transition-colors">
              Cookies
            </a>
            <a href="#" className="hover:text-[#225E56] transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};