import React from 'react';
import { PageView } from '../types';
import { ShieldAlert, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#65A30D] text-stone-950 flex items-center justify-center font-serif font-black text-base">
                FV
              </div>
              <span className="font-serif font-bold text-lg text-white tracking-tight">
                Food Verse <span className="text-[#65A30D]">AI</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Multimodal food intelligence platform uniting computer vision, culinary science,
              and nutritional reasoning for informed food decisions.
            </p>
          </div>

          {/* Core Tools */}
          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              AI Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('recognition')}
                  className="hover:text-white transition-colors"
                >
                  Food Recognition & Macros
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('freshness')}
                  className="hover:text-white transition-colors"
                >
                  Visual Freshness Detection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('hygiene')}
                  className="hover:text-white transition-colors"
                >
                  Commercial Hygiene Monitor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cooking')}
                  className="hover:text-white transition-colors"
                >
                  Smart Cooking & Chef Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('nutrition')}
                  className="hover:text-white transition-colors"
                >
                  Personalized Nutrition Planner
                </button>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Interactive Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="hover:text-white transition-colors"
                >
                  Analysis History & Logs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('settings')}
                  className="hover:text-white transition-colors"
                >
                  Settings & Dietary Profiles
                </button>
              </li>
            </ul>
          </div>

          {/* Responsible AI Notice */}
          <div className="bg-stone-800/60 rounded-xl p-4 border border-stone-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Responsible AI Standards</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Food Verse AI provides estimations and visible pattern evaluations for educational
              guidance. It does not replace certified public health inspections, laboratory tests, or
              medical advice.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Food Verse AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-stone-400">Powered by Google Gemini Multimodal Vision</span>
            <span aria-hidden="true" className="text-stone-700">·</span>
            <span className="text-stone-400">Client-First Data Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
