import React, { useState } from 'react';
import { PageView } from '../types';
import {
  Sparkles,
  Camera,
  ShieldCheck,
  ChefHat,
  Apple,
  Clock,
  Settings,
  LayoutDashboard,
  Home,
  Menu,
  X,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onOpenChat: () => void;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenChat,
  hasApiKey,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: PageView; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'recognition', label: 'Recognition', icon: <Camera className="w-4 h-4" /> },
    { id: 'freshness', label: 'Freshness', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'hygiene', label: 'Hygiene', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'cooking', label: 'Smart Cooking', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'nutrition', label: 'Nutrition', icon: <Apple className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: PageView) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200">
      {!hasApiKey && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Gemini API key is not configured in environment secrets. Multimodal requests will prompt for configuration.
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3B2E]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0E3B2E] text-white flex items-center justify-center shadow-sm group-hover:bg-[#14532D] transition-colors">
              <span className="font-serif font-black text-lg tracking-tight">FV</span>
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-[#0E3B2E] tracking-tight block leading-none">
                Food Verse <span className="text-[#65A30D]">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium block">
                Food Intelligence
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#0E3B2E] bg-stone-200/70 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/40'
                  }`}
                >
                  <span className={isActive ? 'text-[#0E3B2E]' : 'text-stone-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenChat}
              className="px-3 py-1.5 text-xs font-medium text-[#0E3B2E] bg-white border border-stone-200 rounded-lg hover:bg-stone-50 shadow-xs flex items-center gap-1.5 transition-all"
              title="Open AI Culinary Assistant"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#65A30D]" />
              <span>Ask AI</span>
            </button>

            <button
              onClick={() => handleNavClick('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0E3B2E] hover:bg-[#14532D] rounded-lg shadow-sm transition-all"
            >
              Open Dashboard
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenChat}
              aria-label="Open AI Assistant"
              className="p-2 text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              <MessageSquare className="w-5 h-5 text-[#65A30D]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 text-stone-700 hover:bg-stone-100 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-1 shadow-lg">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-[#0E3B2E] rounded-lg text-center"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                onOpenChat();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 text-xs font-medium text-[#0E3B2E] bg-white border border-stone-200 rounded-lg text-center flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#65A30D]" />
              <span>Ask AI Chat</span>
            </button>
          </div>

          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                    isActive
                      ? 'bg-stone-200/80 text-[#0E3B2E] font-semibold'
                      : 'text-stone-700 hover:bg-stone-200/40'
                  }`}
                >
                  <span className={isActive ? 'text-[#0E3B2E]' : 'text-stone-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
